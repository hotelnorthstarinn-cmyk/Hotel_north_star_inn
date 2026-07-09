# 🏨 Hotel North Star Inn

A full-stack hotel management web application for **Hotel North Star Inn** located in Gongabu, Kathmandu, Nepal. Built with Next.js and Supabase, this system serves as both a **public-facing hotel website** and a **comprehensive admin back-office** for managing bookings, food ordering, billing, check-in/check-out operations, and analytics.

## 🚀 Features

### Public-Facing Website
- **Hero Section** — Branding, tagline, and call-to-action with hotel imagery
- **Room Listings** — Browse rooms with gallery images, pricing, capacity, and amenities
- **Room Detail Pages** — In-depth view with full gallery, feature list, and booking form
- **Food Menu** — Categorized menu display with pricing and availability
- **Online Booking** — Date picker, room selection, and guest information form
- **Guest Food Ordering** — Order food during stay (validated via email + room code)
- **Bill Lookup** — Guests can view their bills by searching with email
- **Printable Bill** — Clean print-friendly bill after checkout
- **Guest Reviews** — Submit and read reviews with image upload support
- **Dark / Light Mode** — Theme toggle with system preference detection
- **Responsive Design** — Mobile-first layout with hamburger navigation

### Admin Back-Office (`/admin`)
- **Dashboard** — At-a-glance stats: rooms, bookings, active guests, menu items
- **Check-in Management** — Pending check-ins, active guests, walk-in booking creation
- **Checkout & Billing** — Room charge override, extra charges, food item addition, discount, payment (pending / partial / paid)
- **Room CRUD** — Add, edit, delete rooms with image uploads, features, and pricing
- **Food Menu CRUD** — Add, edit, delete menu items with categories, images, and availability toggle
- **Order Management** — Approve, reject, prepare, and deliver guest food orders
- **Bill Management** — View and edit bills, add charges, record payments
- **Analytics** — Monthly revenue breakdown (room / food / extra), expense tracking, active guest counts
- **Data Export** — CSV export of bookings, bills, orders, and expenses by date range

### Automated Workflows
- Auto bill creation on booking (room charge = price × nights)
- Auto room status update on check-in (→ booked) and check-out (→ available)
- Approved food orders automatically charged to guest bill
- Email notifications via **Resend**: booking confirmation and new order alerts

---

## 🧱 Tech Stack

| Category              | Technology                                     |
| --------------------- | ---------------------------------------------- |
| **Framework**         | [Next.js](https://nextjs.org/) 16.2.6          |
| **Language**          | TypeScript 5                                   |
| **UI Library**        | React 19.2.4                                   |
| **Styling**           | Tailwind CSS v4                                |
| **PostCSS**           | @tailwindcss/postcss                           |
| **Database**          | Supabase (PostgreSQL)                          |
| **Authentication**    | Supabase SSR Auth (email/password)             |
| **Email**             | Resend                                         |
| **Icons**             | lucide-react, react-icons                      |
| **Theme**             | next-themes                                    |
| **UI Primitives**     | Radix UI (Dialog, Dropdown, Label, Select, Tabs, Toast) |
| **Class Utilities**   | clsx, tailwind-merge, class-variance-authority |
| **Notifications**     | Sonner (toast notifications)                   |
| **Linting**           | ESLint (flat config)                           |
| **Fonts**             | Geist Sans / Geist Mono (variable fonts)       |
| **Deployment**        | Netlify                                        |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Navbar, Footer, Providers)
│   ├── page.tsx                  # Homepage (Hero, Overview, Amenities, Booking, Reviews)
│   ├── providers.tsx             # Theme + toast providers
│   ├── proxy.ts                  # Auth middleware (protects /admin/*)
│   ├── food/                     # Public food menu
│   ├── rooms/                    # Room listing + detail pages
│   ├── order-food/               # Guest food ordering
│   ├── my-bill/                  # Guest bill lookup
│   ├── bill/[bookingId]/         # Printable bill
│   ├── auth/callback/            # Supabase OAuth callback
│   ├── api/bookings/             # Booking API route
│   └── admin/
│       ├── (auth)/               # Login page
│       └── (protected)/          # Dashboard, checkins, checkout,
│                                 # rooms, menu, orders, bills,
│                                 # analytics, export
│
├── components/
│   ├── ui/                       # Reusable primitives (button, card, input, etc.)
│   └── admin/                    # Admin-specific components
│
├── lib/
│   ├── actions.ts                # All server actions (business logic)
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server-side Supabase client (cookies)
│   ├── supabase-admin.ts         # Admin Supabase client (service role)
│   ├── utils.ts                  # Utility functions (cn, formatPrice, etc.)
│   └── guest-storage.ts          # Guest info localStorage hook
│
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

**Tables:**

| Table           | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `rooms`         | Room catalog (name, price, capacity, status)    |
| `bookings`      | Guest bookings (check-in/out, room, status)     |
| `food_menu`     | Food items (name, price, category, availability) |
| `orders`        | Food orders linked to bookings                  |
| `order_items`   | Line items within an order                      |
| `bills`         | Guest bills (charges, discount, total, status)  |
| `bill_charges`  | Individual charge line items                    |
| `reviews`       | Guest reviews (rating, comment, image)          |
| `expenses`      | Hotel expenses for analytics                    |

**Key Database Functions:**
- `lookup_guest(email, room_code)` — Validates guest for food ordering
- `is_room_available(room_id, check_in, check_out)` — Availability check
- `update_bill_totals(bill_id)` — Recalculates bill from line items
- `get_booking_bill(booking_id)` — Returns bill summary for a booking
- `monthly_revenue(year, month)` — Aggregates revenue/expenses
- Auto-triggers for bill creation, room status updates, and order-to-bill integration

**Storage:** `hotel_images` bucket (public) for room, food, and review images.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 20
- npm
- A Supabase project
- A Resend API key (for email notifications)

### Setup

```bash
# Clone the repository
git clone https://github.com/Aagaman1229/Gorkhali_Bisauni_Lodge_And_Hotel.git
cd hotel_north_star_inn

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Fill in your `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### Database

Run the schema file against your Supabase project:

```bash
psql -h your-supabase-host -d postgres -U postgres -f supabase/schema.sql
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
npm run build
npm start
```

---

## 📜 Scripts

| Script    | Command       |
| --------- | ------------- |
| `dev`     | `next dev`    |
| `build`   | `next build`  |
| `start`   | `next start`  |
| `lint`    | `eslint .`    |

---

## 🌐 Deployment

The project includes a `netlify.toml` for **Netlify** deployment:

- Build command: `npm run build`
- Publish directory: `.next`
- Optimized cache headers for images and static assets
- SPA-style redirect for `/admin/*` routes

---

## 📄 License

Private — All rights reserved.
