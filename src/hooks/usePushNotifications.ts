'use client'

import { useState, useEffect, useTransition } from 'react'
import { saveSubscription } from '@/app/actions/push-notifications'

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission)
            checkSubscription()
        }
    }, [])

    async function checkSubscription() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        }
    }

    async function subscribeToPush() {
        setError(null)
        if (!('serviceWorker' in navigator)) {
            const msg = 'Service Workers need HTTPS or localhost. If you are testing on phone locally, this wont work without HTTPS.'
            setError(msg)
            alert(msg) // Explicit alert for mobile debugging
            return
        }

        if (!('Notification' in window)) {
            const msg = 'This browser does not support Notifications. On iOS, you MUST "Add to Home Screen" first.'
            setError(msg)
            alert(msg)
            return
        }

        setLoading(true)
        try {
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            const permissionResult = await Notification.requestPermission()
            setPermission(permissionResult)

            if (permissionResult !== 'granted') {
                throw new Error('Permission not granted')
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            })

            // Use transition for server action
            startTransition(async () => {
                try {
                    await saveSubscription(subscription.toJSON())
                    setIsSubscribed(true)
                    setLoading(false)
                    console.log('User subscribed to push notifications')
                } catch (serverError) {
                    console.error('Failed to save subscription:', serverError)
                    setError(serverError instanceof Error ? serverError.message : 'Failed to save subscription')
                    setLoading(false)
                }
            })
        } catch (error) {
            console.error('Failed to subscribe:', error)
            setError(error instanceof Error ? error.message : 'Failed to subscribe')
            alert('Failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
            setLoading(false)
        }
    }

    return {
        permission,
        isSubscribed,
        loading: loading || isPending,
        error,
        subscribeToPush
    }
}
