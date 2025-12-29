# Production Environment Variables Checklist

To fix the `ERR_CONNECTION_REFUSED` and ensure your database/Stripe integrations work in production, you MUST set the following environment variables in your deployment platform (e.g., Vercel).

### Authentication (`better-auth`)
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `BETTER_AUTH_URL` | `https://gestmais.pt` | The base URL of your deployed app (MUST use https). |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://gestmais.pt` | Required for the client-side auth client (MUST use https). |
| `BETTER_AUTH_SECRET` | `your_long_random_secret` | A secret string for signing auth tokens. |

### Application
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | `https://gestmais.pt` | Used for Stripe redirects (MUST use https). |

### Database (CloudSQL)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://USER:PASSWORD@PUBLIC_IP:5432/DB_NAME` | Connection string to your CloudSQL instance. |

> [!IMPORTANT]
> Since you have set CloudSQL to `0.0.0.0/0`, you can connect using the Public IP directly. Make sure the `DATABASE_URL` uses the Public IP shown in your Google Cloud Console.

### Stripe
| Variable | Description |
| :--- | :--- |
| `STRIPE_SECRET_KEY` | Your Stripe Secret Key (`sk_test_...` or `sk_live_...`). |
| `STRIPE_PRICE_ID` | The ID of the price/product you are selling. |
| `STRIPE_WEBHOOK_SECRET` | (Optional) If you have a webhook set up to listen for Stripe events. |

---

### How to set these in Vercel:
1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard).
2. Go to **Settings** > **Environment Variables**.
3. Add each of the variables above.
4. **Redeploy** your application for the changes to take effect.
