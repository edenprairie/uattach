# Uattach wholesale equipment portal

Uattach is a B2B product and order-request site for equipment attachments.
The public homepage introduces the business and shows a lightweight preview of the Standard Low Pro Bucket sample sheet.
Approved member accounts can open the PDF catalog, choose a bucket size and quantity, and prepare an order request.
The order page shows estimated product weights and the current container plan without prices or payment fields.
Customer accounts have a separate sign-in route and a placeholder workspace while their requirements are being defined.

## Current product sample

The supplied file `requirement/Standard-Low-Pro-Bucket-3.pdf` is the initial member catalog.
It currently has one page and lists five widths: 62, 68, 74, 80, and 84 inches.
Variant weights use the PDF's "weight with bolt on cutting edge" row, converted from pounds to kilograms.
The homepage preview is generated as `public/catalog/standard-low-pro-bucket-preview.webp`.
The full PDF is intended to live in the private R2 bucket and is served through an authenticated route.

## Current architecture

- Next.js App Router and React.
- Cloudflare Workers deployment through the existing OpenNext adapter.
- Cloudflare R2 binding named `CATALOG` for the member catalog PDF.
- Cloudflare D1 for products, users, sessions, and orders.
- Existing server-side container planning logic, with a 22,000 kg container maximum and 18,000 kg minimum final-container weight.
- PBKDF2 password hashes and random, database-backed sessions in HttpOnly cookies.

The application database and private catalog storage are both hosted by Cloudflare.

## Local development

Install dependencies with `npm install`.
Apply `migrations/0001_initial.sql` to the local D1 database with `npx wrangler d1 migrations apply uattach-app --local`.
Set `ADMIN_SETUP_TOKEN` in `.dev.vars` and run the application with `npm run dev`.
Create the first administrator at `/setup/admin`; the setup endpoint closes after the first administrator is created.
The migration seeds the sample bucket variants with stable product IDs used by the order flow.

The catalog viewer reads the PDF from R2 and will show a storage-not-configured or file-not-found state until the binding and object are available.
For a local Wrangler R2 object, run `npx wrangler r2 object put uattach-private-catalog/standard-low-pro-bucket.pdf --file="requirement/Standard-Low-Pro-Bucket-3.pdf" --local`.

## Cloudflare setup

The Worker custom domain in `wrangler.jsonc` is `www.uattach.com`.
The `APP_DB` binding expects a D1 database named `uattach-app`.
The `CATALOG` binding expects an R2 bucket named `uattach-private-catalog`.
Create both resources in the intended Cloudflare account, update the D1 database ID in `wrangler.jsonc`, apply the migration, and upload the PDF with `npx wrangler r2 object put uattach-private-catalog/standard-low-pro-bucket.pdf --file="requirement/Standard-Low-Pro-Bucket-3.pdf"`.
Set `ADMIN_SETUP_TOKEN` as a Worker secret before deployment.
Configure the domain and the Worker custom-domain route in the intended Cloudflare account before deploying.
The root domain redirect to `www` still needs to be configured in Cloudflare.

Deploy with `npm run deploy` after the D1 binding, R2 bucket, database migration, setup secret, and domain route are ready.
Do not expose the R2 bucket publicly because the API route enforces member access before returning the catalog.

## Verification

Run `npm run lint` for ESLint.
Run `npm run build` for the Next.js production build and TypeScript checks.
The Cloudflare-specific OpenNext preview or deployment should also be run after the Cloudflare account resources are configured.
