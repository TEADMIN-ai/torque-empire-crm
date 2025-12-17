# Torque Empire CRM

A minimal React dashboard showcasing Dolibarr contacts integration. Provide your Dolibarr API base URL (e.g.
`https://your-dolibarr.example.com/api/index.php`) and API key to sync contacts, filter them quickly, and view core
fields in a responsive table alongside a curated open-deals snapshot.

## Quick start
1. Install dependencies: `npm install`
2. Run locally: `npm start`
3. Enter your Dolibarr API base URL and API key, then click **Sync contacts** on the **/dashboard** route.

The dashboard now includes:
- An API connection card with inline validation and last-sync indicator.
- Contact stats and filterable table rows (placeholder data shown until you sync).
- An open-deals grid to highlight pipeline health.

Credentials are only kept in memory while the page is open. For production deployments, use environment variables or a
backend proxy to protect secrets.
