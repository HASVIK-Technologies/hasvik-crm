This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## API setup

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` to the API root. The shared client is available from `lib/api-client.ts`:

```ts
import { apiClient } from "@/lib/api-client";

const response = await apiClient.get("/businesses");
```

Use `useAuthStore` from `store/auth-store.ts` to set or clear the token. The list state lives in `store/business-list-store.ts`, API hooks live in `hooks/use-businesses.ts`, and shared domain/API types live in `types/`. The Axios client adds the token as a bearer token, clears it after a `401`, and sends API, network, and timeout failures through the global Sonner toast.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Tenant signup and subscriptions

The public `/tenant` page creates a workspace and its administrator through `POST /api/tenants`. HASVIK admins can review tenant accounts, edit organization/contact details, and activate or deactivate access at `/tenant-management` using the `/api/tenants` endpoints.

The `/subscriptions` page loads available plans and tenant subscriptions from the API. Standard sign-ins land on `/businesses`; new workspace admins can use the signup completion link to sign in and land on `/subscriptions`. Workspace admins can submit plan requests for HASVIK-admin approval, renew with a confirmation, or cancel their active subscription. HASVIK admins can select tenants, approve pending requests by setting their status to `ACTIVE`, reject them as `REJECTED`, and cancel active subscriptions. All subscription status changes use `PATCH /api/subscriptions/{id}/status`. A tenant without a current subscription is restricted to subscription management for its admin; other workspace users see an access notice and must contact their admin. Cancellation marks a subscription `CANCELLED` while the tenant retains access until the subscription end date. The UI also displays `SUSPENDED` subscription states. Subscription creation and renewal do not process payments; a payment gateway or payment-verification workflow is not exposed by the current API.

## Workspace administration

Tenant admins can manage workspace users at `/users` and business categories at `/business-categories`. Signed-in users can view and update their account details at `/profile`. These pages use the documented `/users` and `/categories` API operations; the backend remains responsible for enforcing role permissions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
