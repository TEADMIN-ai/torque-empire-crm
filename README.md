# Torque Empire CRM

A minimal React dashboard showcasing Dolibarr contacts integration. Provide your Dolibarr API base URL (e.g.
`https://your-dolibarr.example.com/api/index.php`) and API key to sync contacts, filter them quickly, and view core
fields in a responsive table alongside a curated open-deals snapshot.

## Quick start
1. Install dependencies: `npm install`
2. Run locally: `npm start`
3. Enter your Dolibarr API base URL and API key, then click **Sync contacts** on the **/dashboard** route.

### Firebase authentication

- Ensure the admin user `ckaraniete.za@gmail.com` exists in Firebase Authentication before signing in.
- Create a `.env.local` file with your Firebase credentials (restart the dev server after editing):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

The dashboard requires a successful Firebase email/password login before viewing Dolibarr data and includes clear error
messages if authentication fails or environment variables are missing.

The dashboard now includes:
- An API connection card with inline validation and last-sync indicator.
- Contact stats and filterable table rows (placeholder data shown until you sync).
- An open-deals grid to highlight pipeline health.

Credentials are only kept in memory while the page is open. For production deployments, use environment variables or a
backend proxy to protect secrets.
