'use server'

import webpush from 'web-push'
import { db } from "@/db"
import { pushSubscriptions } from "@/db/schema"
import { eq } from "drizzle-orm"
import { requireSession } from "@/lib/auth-helpers"

// Initialize web-push only when needed to avoid build-time errors
function initWebPush() {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        throw new Error('VAPID keys are missing')
    }
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:support@gestmais.pt',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export async function saveSubscription(subscription: PushSubscriptionJSON) {
    const session = await requireSession()

    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        throw new Error('Invalid subscription object')
    }

    try {
        await db.insert(pushSubscriptions).values({
            userId: session.user.id,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        }).onConflictDoNothing({ target: pushSubscriptions.endpoint })

        return { success: true }
    } catch (error) {
        console.error('Error saving subscription:', error)
        return { success: false, error: 'Failed to save subscription' }
    }
}

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
    initWebPush()
    try {
        const subscriptions = await db
            .select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.userId, userId))

        const notificationPayload = JSON.stringify({
            title,
            body,
            url,
        })

        const promises = subscriptions.map((sub) => {
            return webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                notificationPayload
            ).catch(async (error) => {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired or invalid, remove from DB
                    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, sub.endpoint))
                }
                console.error('Error sending push notification:', error)
            })
        })

        await Promise.all(promises)
        return { success: true }
    } catch (error) {
        console.error('Error sending push to user:', userId, error)
        return { success: false }
    }
}
