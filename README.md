# Uattach Product Order System

Uattach is a Next.js product ordering tool for heavy equipment attachments. Users can browse product spec sheets, add products to an order, see how the order is split into shipping containers by weight, submit checkout details, and review saved orders. Admin users can view all orders, manage users, reset passwords, and update order status.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 6
- PostgreSQL
- `react-pdf` / `pdfjs-dist` for PDF thumbnails
- `canvas-confetti` on checkout success

## Local Setup

Install dependencies:

```bash
npm install
```

Create an `.env` file with a PostgreSQL connection string:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Create/update the database schema:

```bash
npx prisma db push
```

Seed demo data:

```bash
npx prisma db seed
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

The seed script creates two users:

- Admin: `admin` / `Admin#987`
- User: `demo` / `Demo#123`

Passwords are currently stored as plain text for prototype use. Do not use this auth model in production.

## Scripts

```bash
npm run dev      # Start Next.js dev server with webpack
npm run build    # Production build
npm run start    # Start built app
npm run lint     # ESLint
```

The `postinstall` hook runs `prisma generate`.

## Project Structure

```text
src/app/                  Next.js routes and server actions
src/app/actions.ts        Database-backed server actions
src/components/           Shared UI components
src/context/              Client auth and cart providers
src/lib/                  Types, constants, Prisma client, order logic
prisma/schema.prisma      Database schema
prisma/seed.ts            Demo users and product seed data
public/assets/            Local product PDFs and images
public/specs/             Seed product PDF spec sheets
tests/                    Lightweight TypeScript tests
```

## Core User Flows

### Catalog

[src/app/page.tsx](src/app/page.tsx) renders the product catalog. It starts with mock products from [src/lib/mockData.ts](src/lib/mockData.ts), then loads database products through `getProducts()` in [src/app/actions.ts](src/app/actions.ts). If database products exist, they replace the mock catalog.

Product cards render PDF thumbnails with [src/components/PDFThumbnail.tsx](src/components/PDFThumbnail.tsx). The PDF modal uses a browser PDF object embed.

### Cart And Container Planning

Cart state lives in [src/context/CartContext.tsx](src/context/CartContext.tsx) and is persisted to localStorage as `uattach-cart`.

The cart calculates a preview container split with [src/lib/containerLogic.ts](src/lib/containerLogic.ts):

- Maximum container weight: `22000 kg`
- Minimum final container weight: `18000 kg`
- Packing strategy: greedy, quantity-splitting allowed

The preview is for user feedback only. The database write path recalculates containers server-side before saving an order.

### Checkout

[src/components/CheckoutForm.tsx](src/components/CheckoutForm.tsx) submits:

- Optional `userId`
- Shipping address
- Product IDs and quantities
- Split strategy label

It does not submit trusted container totals. The server validates the item list, fetches product weights from PostgreSQL, recalculates containers with [src/lib/orderPersistence.ts](src/lib/orderPersistence.ts), then saves the order in one Prisma transaction.

### Order Persistence

`createOrder()` in [src/app/actions.ts](src/app/actions.ts):

1. Validates submitted items and shipping address.
2. Fetches product weights from the database.
3. Builds the persisted container plan server-side.
4. Creates the `Order` and `ShippingAddress`.
5. Creates each `Container`.
6. Creates `OrderItem` rows linked to both the order and the saved container.
7. Returns the order with products, containers, container items, shipping address, and user.

Orders are now database-backed after checkout. The old `uattach-orders` localStorage fallback is no longer used for new order history.

### Orders

[src/app/orders/page.tsx](src/app/orders/page.tsx) loads orders through `getUserOrders(user.id)`.

- Admin users receive all orders.
- Non-admin users receive only their own orders.
- Containers are returned with nested order items and products.

[src/app/orders/[id]/page.tsx](src/app/orders/[id]/page.tsx) loads an individual order through `getOrder(orderId)` instead of localStorage. Admin status changes call `updateOrderStatus()`, which verifies the acting user is an admin before updating the database.

### Auth And Users

Auth state lives in [src/context/AuthContext.tsx](src/context/AuthContext.tsx) and is stored in localStorage as `uattach-user`.

Server actions provide:

- `loginUser()`
- `registerUser()`
- `getUsers()`
- `updateUserPassword()`

[src/app/admin/users/page.tsx](src/app/admin/users/page.tsx) uses these actions for user management.

This is still prototype auth:

- Passwords are plain text.
- Sessions are localStorage only.
- There is no cookie/session middleware.
- Client-side route protection is not enough for production.

## Data Model

The Prisma schema is in [prisma/schema.prisma](prisma/schema.prisma).

Main models:

- `User`: login identity, role, optional shipping address, related orders
- `Product`: catalog item, PDF URL, optional image URL, weight, features
- `Order`: submitted order, status, total weight, split strategy, address, containers, items
- `OrderItem`: product quantity linked to an order and optionally a container
- `Container`: order container number, total weight, max weight, nested items
- `ShippingAddress`: checkout/profile address data

`OrderItem` rows are stored at the container level when orders are created. If a product quantity is split across containers, there will be one `OrderItem` row per container allocation.

## Product Data

There are two product sources:

- [src/lib/mockData.ts](src/lib/mockData.ts) uses local bucket PDFs under `public/assets`.
- [prisma/seed.ts](prisma/seed.ts) creates database products using PDFs under `public/specs`.

When the database has products, the homepage displays seeded database products. When the database is unavailable or empty, the homepage falls back to mock products.

## Testing And Verification

There is no full test runner configured yet. The current lightweight TypeScript test verifies server-side container persistence planning:

```bash
npx ts-node --project tsconfig.json --compiler-options '{"module":"commonjs"}' tests/orderPersistence.test.ts
```

General checks:

```bash
npm run lint
npm run build
```

## Known Limitations

- Auth is prototype-only and should be replaced with secure password hashing plus real sessions.
- Profile shipping address currently updates only the local user object, not the Prisma `ShippingAddress` relation.
- Product admin/editing screens do not exist yet.
- There is no order deletion, cancellation, or audit trail.
- `getOrder(orderId)` does not enforce per-user authorization yet.
- Server actions return user records in some order queries; avoid exposing password fields before production hardening.
- PDF thumbnail workers load from `unpkg.com`, which requires network access in the browser.
- The README setup assumes an external PostgreSQL database; no local Docker Compose file is included.

## Recommended Next Work

1. Replace localStorage auth with real session-backed authentication.
2. Persist profile shipping addresses through a server action.
3. Add order authorization checks for non-admin detail access.
4. Add product management for admins.
5. Add a proper test runner and cover checkout/order persistence end to end.
6. Align mock products and seeded products so local fallback and database catalog show the same business data.
