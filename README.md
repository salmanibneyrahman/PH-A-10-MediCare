# MediCare Connect — Hospital Appointment & Healthcare Management System

A production-ready, full-stack healthcare platform built with Next.js 16, Express.js, and MongoDB. Connects patients with verified doctors through appointment booking, Stripe payments, digital prescriptions, and role-based dashboards for patients, doctors, and administrators.

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://medicare-live.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5-green)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.4-green)](https://mongodb.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-purple)](https://www.better-auth.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)](https://stripe.com/)
[![HeroUI](https://img.shields.io/badge/HeroUI-v3-orange)](https://heroui.com/)

---

## Live Links

| Resource | URL |
|---|---|
| **Live Site** | [https://medicare-live.vercel.app](https://medicare-live.vercel.app) |
| **API Server** | [https://medicare-app-server.vercel.app](https://medicare-app-server.vercel.app) |
| **Client Repository** | [PH-A-10-MediCare](https://github.com/salmanibneyrahman/PH-A-10-MediCare) |
| **Server Repository** | [MediCare-Server](https://github.com/salmanibneyrahman/MediCare-Server) |

### Demo Administrator Access

```
Email:    admin@medicare.com
Password: Admin@123
```

> Credentials are also displayed on the login page for reviewer convenience. Use this account to verify doctors, manage users, and access platform analytics.

---

## Preview

![MediCare Connect — Home Page](image.png)

---

## Purpose

Traditional hospital appointment systems suffer from long waiting times, manual paperwork, and poor communication between patients and providers. MediCare Connect digitises the entire care journey for all three parties involved.

Patients search verified specialists, book slots against genuine availability, pay securely through Stripe, and retain a permanent record of every prescription and visit. Doctors publish a professional profile, control their weekly schedule, triage incoming requests, and issue digital prescriptions the moment a consultation ends. Administrators verify practitioner credentials before anyone becomes bookable, monitor every appointment and transaction across the platform, and read overall health from live analytics.

The result is a single source of truth for the clinical relationship, with no phone tag, no paper slips, and no lost records.

---

## Key Features

### Appointment Lifecycle

Booking is availability-aware: the date picker rejects any weekday the doctor does not practise, and the same rule is validated again on submit against the doctor's `availableDays` array, so a crafted request cannot bypass it.

Each appointment moves through a defined state machine of `pending`, `confirmed`, and `completed`, with `cancelled` and `rejected` as terminal states. Patients can reschedule a booking to a new slot or cancel it entirely; cancellation performs a soft delete so the audit trail survives. On the other side, doctors accept, reject, or mark a consultation complete, and completing one routes them directly into prescription authoring.

### Payments Through Stripe

Payments use the Payment Intents API with the embedded `PaymentElement`, themed to match the dark interface. Card details are collected inside Stripe's own iframe and never reach the application servers.

Verification happens server-side rather than on trust: the backend calls `stripe.paymentIntents.retrieve()` and rejects any status other than `succeeded`, so a forged confirmation request cannot mark an appointment as paid. Recording is idempotent, meaning a duplicate `transactionId` or `appointmentId` returns a `409` response instead of charging twice. If a patient closes the modal without paying, the appointment simply remains `unpaid` and can be settled later from the dashboard.

### Authentication and Authorization

Authentication runs on Better Auth, supporting both email and password credentials and Google OAuth. The Express API verifies every token cryptographically against the `/api/auth/jwks` endpoint using `jose`, which means no shared secret is duplicated between the two services.

Access control is layered. A `verifyToken` middleware establishes identity, then `verifyDoctor` or `verifyAdmin` narrows it further on each private route. Registration is protected by a server-side whitelist that allows only the `patient` and `doctor` roles to be self-selected, so administrator privileges can never be granted from the client. Sessions persist across page refreshes, keeping protected routes accessible after a reload.

### Role-Based Dashboards

The **patient dashboard** presents overview statistics alongside appointment management, payment history, digital prescriptions, full review CRUD, and profile editing.

The **doctor dashboard** surfaces patient, appointment, and review counts, then provides weekly schedule management, request triage, prescription authoring, and professional profile controls. Unverified doctors reach this dashboard immediately and see a pending-verification banner, rather than being downgraded to a patient view while they wait.

The **admin dashboard** covers user management with suspend and delete actions, the doctor verification workflow, platform-wide appointment monitoring, a payment ledger, and analytics rendered with Recharts.

### Search, Sorting, and Pagination

Search runs a MongoDB `$regex` query across doctor name, specialization, and hospital simultaneously, so a single input covers all three. Four sort modes are available: consultation fee ascending or descending, most experienced, and highest rated.

Regardless of the chosen sort, an aggregation pipeline adds an `isVerified` boolean and orders on it first, which keeps approved doctors above pending ones. Pagination is handled server-side with `$skip` and `$limit`, returning total-count metadata so the page controls can render accurately. A layout toggle lets visitors switch the same results between a card grid and a table.

### Interface

The interface uses a glassmorphic dark theme built around a cyan and indigo palette with backdrop blur, designed specifically for this project rather than adapted from a template. Framer Motion animates the hero and feature sections.

Responsiveness is handled deliberately: every data table collapses into stacked cards below the `md` breakpoint instead of overflowing horizontally, so smaller screens receive a layout intended for them. The profile photo field validates URLs live by loading the image in the background and showing either a preview thumbnail or an inline error before the form is submitted. Feedback throughout comes from React Toastify notifications, a custom 404 page, and contextual loading states.

---

## Tech Stack

```
Frontend Architecture
├── Next.js 16.2.9          (App Router, Server Components)
├── React 19.2.4
├── HeroUI v3.2.1           (Compound component library)
├── Tailwind CSS v4         (CSS-first configuration)
├── Better Auth 1.6.22      (Email/password + Google OAuth)
├── Framer Motion           (Section animations)
├── Recharts 3.9.2          (Analytics visualisation)
├── Stripe.js + React       (PaymentElement)
└── React Toastify 11.1.0   (Notifications)

Backend Architecture
├── Express.js 5            (REST API)
├── MongoDB Driver 7.4.0    (Native driver, no ODM)
├── jose-cjs                (JWKS token verification)
├── Stripe Node SDK         (Payment Intents)
└── CORS                    (Origin allowlist)

Database Schema (MongoDB Atlas — "MediCare")
├── user           (name, email, role, photo, phone, gender, status, createdAt)
├── doctors        (doctorName, specialization, qualifications[], experience,
│                   consultationFee, hospitalName, profileImage, availableDays[],
│                   availableSlots[], verificationStatus, averageRating, totalReviews)
├── appointments   (patientId, patientName, patientPhoto, doctorId, doctorName,
│                   specialization, consultationFee, appointmentDate, appointmentTime,
│                   symptoms, appointmentStatus, paymentStatus)
├── reviews        (patientId, patientName, patientPhoto, doctorId, doctorName,
│                   rating, reviewText, createdAt)
├── payments       (appointmentId, patientId, patientName, doctorId, doctorName,
│                   amount, transactionId, paymentMethod, paymentDate)
└── prescriptions  (doctorId, patientId, appointmentId, diagnosis, medications,
                    notes, createdAt)

Deployment
├── Vercel (Frontend — Next.js)
└── Vercel (Backend — Express serverless function)
```

---

## Installation

### Prerequisites

You will need Node.js 18 or later with npm 9 or later, a MongoDB Atlas cluster, and a
Stripe account in test mode. Google OAuth credentials are optional and only required if
you want social login enabled.

### Frontend Setup

```bash
git clone https://github.com/salmanibneyrahman/PH-A-10-MediCare.git
cd PH-A-10-MediCare
npm install
```

**Environment configuration — `.env.local`:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_SECRET=minimum-32-character-random-secret-string
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

```bash
npm run dev
# http://localhost:3000
```

### Backend Setup

```bash
git clone https://github.com/salmanibneyrahman/MediCare-Server.git
cd MediCare-Server
npm install
```

**Environment configuration — `.env`:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

```bash
npm run dev
# http://localhost:5000
```

> Note that `FRONTEND_URL` must not carry a trailing slash, because it is used to construct both the JWKS endpoint and the CORS allowlist.

### Creating an Administrator

Register normally through the UI, then promote the account once via `mongosh`:

```js
use MediCare
db.user.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Sign out and back in. The login handler reads the role from the database and routes the session to `/dashboard/admin`.

---

## Project Structure

```
medicare/
├── src/
│   ├── app/
│   │   ├── page.jsx                          # Home — banner, featured doctors, stats
│   │   ├── layout.jsx                        # Root layout, metadata, providers
│   │   ├── not-found.jsx                     # Custom 404
│   │   ├── globals.css                       # Tailwind v4 + glassmorphism utilities
│   │   ├── about/page.jsx
│   │   ├── contact/page.jsx
│   │   ├── login/page.jsx                    # Email + Google, demo admin panel
│   │   ├── register/page.jsx                 # Role selection, password strength
│   │   ├── find-doctors/
│   │   │   ├── page.jsx                      # Search, sort, paginate, card/table
│   │   │   └── [id]/page.jsx                 # Profile, schedule, reviews, booking
│   │   ├── dashboard/
│   │   │   ├── layout.jsx                    # Role-aware sidebar + top bar
│   │   │   ├── patient/
│   │   │   │   ├── page.jsx                  # Overview
│   │   │   │   ├── appointments/page.jsx     # View, reschedule, cancel, pay
│   │   │   │   ├── payments/page.jsx         # Transaction history
│   │   │   │   ├── prescriptions/page.jsx    # Digital prescriptions
│   │   │   │   ├── reviews/page.jsx          # Review CRUD
│   │   │   │   └── profile/page.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── page.jsx                  # Overview
│   │   │   │   ├── schedule/page.jsx         # Days & slots
│   │   │   │   ├── appointments/page.jsx     # Accept / reject / complete
│   │   │   │   ├── prescriptions/page.jsx    # Create & update
│   │   │   │   └── profile/page.jsx
│   │   │   └── admin/
│   │   │       ├── page.jsx                  # Overview
│   │   │       ├── users/page.jsx            # Suspend, delete
│   │   │       ├── doctors/page.jsx          # Verification workflow
│   │   │       ├── appointments/page.jsx     # Platform-wide monitoring
│   │   │       ├── payments/page.jsx         # Payment ledger
│   │   │       └── analytics/page.jsx        # Recharts dashboards
│   │   └── api/auth/[...all]/route.js        # Better Auth handler
│   ├── components/
│   │   ├── Navbar.jsx                        # Role-aware navigation
│   │   ├── Footer.jsx
│   │   ├── LayoutShell.jsx                   # Hides chrome on dashboard routes
│   │   ├── DoctorCard.jsx
│   │   ├── PaymentModal.jsx                  # Stripe Elements
│   │   ├── StarRating.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── SectionHeading.jsx
│   │   └── LoadingSpinner.jsx
│   ├── context/
│   │   └── AuthContext.jsx                   # Session + DB user, avatar resolution
│   └── lib/
│       ├── api.js                            # Centralised fetch client with JWT
│       ├── auth.js                           # Better Auth server config
│       ├── authClient.js                     # Better Auth client
│       └── stripe.js                         # Stripe loader + dark appearance
├── public/
├── next.config.mjs
└── package.json

medicare-server/
├── index.js                                  # Express app, all routes
├── vercel.json                               # Serverless routing
└── package.json
```

---

## API Documentation

All protected endpoints require:

```
Authorization: Bearer <JWT from /api/auth/token>
```

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | List all users |
| `GET` | `/api/users/:email` | Owner / Admin | Fetch single user |
| `POST` | `/api/users` | Public | Create or sync profile (idempotent) |
| `PATCH` | `/api/users/:email` | Owner / Admin | Update profile |
| `DELETE` | `/api/users/:id` | Admin | Remove user |
| `PATCH` | `/api/users/:id/status` | Admin | Activate / suspend |

### Doctors

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/doctors` | Public | Search, sort, paginate |
| `GET` | `/api/doctors/featured` | Public | Top 6 verified by rating |
| `GET` | `/api/doctors/:id` | Public | Single profile |
| `GET` | `/api/doctors/profile/:email` | Owner / Admin | Profile by email |
| `GET` | `/api/admin/doctors` | Admin | All doctors, any status |
| `POST` | `/api/doctors` | Authenticated | Create profile (`pending`) |
| `PATCH` | `/api/doctors/:id` | Owner / Admin | Update profile |
| `PATCH` | `/api/doctors/:id/verify` | Admin | Verify / reject / revoke |

**Search example:**

```http
GET /api/doctors?search=cardio&specialization=Cardiology&sortBy=rating&page=1&limit=9
```

```json
{
  "doctors": [ { "_id": "...", "doctorName": "Dr. Sarah Johnson", "specialization": "Cardiology", "experience": 12, "consultationFee": 150, "averageRating": 4.8, "verificationStatus": "verified" } ],
  "total": 24,
  "page": 1,
  "totalPages": 3
}
```

### Appointments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/appointments` | Admin | All appointments |
| `GET` | `/api/appointments/patient/:patientId` | Owner / Admin | Patient's bookings |
| `GET` | `/api/appointments/doctor/:doctorId` | Doctor / Admin | Doctor's bookings |
| `POST` | `/api/appointments` | Authenticated | Create booking |
| `PATCH` | `/api/appointments/:id` | Participant / Admin | Update status or reschedule |
| `DELETE` | `/api/appointments/:id` | Patient / Admin | Soft-cancel |

### Payments & Stripe

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payments` | Admin | Full ledger |
| `GET` | `/api/payments/patient/:patientId` | Owner / Admin | Patient history |
| `POST` | `/api/payments` | Authenticated | Record payment |
| `POST` | `/api/stripe/create-payment-intent` | Authenticated | Returns `clientSecret` |
| `POST` | `/api/stripe/confirm-payment` | Authenticated | Verifies with Stripe, then records |

**Payment flow:**

```
Patient clicks Pay
   ↓
POST /api/stripe/create-payment-intent  →  Stripe  →  clientSecret
   ↓
<Elements clientSecret> renders <PaymentElement>
   ↓
stripe.confirmPayment()   — card data goes directly to Stripe
   ↓
POST /api/stripe/confirm-payment
   ↓
Server calls paymentIntents.retrieve() and rejects unless "succeeded"
   ↓
payments document written · appointment → paid / confirmed
```

### Reviews & Prescriptions

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reviews` | Public | Latest 10 (homepage testimonials) |
| `GET` | `/api/reviews/doctor/:doctorId` | Public | Reviews for a doctor |
| `GET` | `/api/reviews/patient/:patientId` | Owner / Admin | Patient's reviews |
| `POST` | `/api/reviews` | Authenticated | Create, recalculates doctor average |
| `PATCH` | `/api/reviews/:id` | Owner / Admin | Update, recalculates average |
| `DELETE` | `/api/reviews/:id` | Owner / Admin | Delete, recalculates average |
| `GET` | `/api/prescriptions/appointment/:id` | Participant / Admin | By appointment |
| `GET` | `/api/prescriptions/patient/:id` | Owner / Admin | Patient's prescriptions |
| `POST` | `/api/prescriptions` | Doctor | Create |
| `PATCH` | `/api/prescriptions/:id` | Doctor | Update |

### Statistics

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Public | Homepage counters |
| `GET` | `/api/admin/analytics` | Admin | Charts, revenue, doctor performance |

---

## JWT Verification & Role-Based Authorization

*Challenge 3 implementation.*

### Why JWKS Instead of a Shared Secret

Better Auth signs tokens with an asymmetric key pair and publishes only the public half at `/api/auth/jwks`. The Express API fetches that key and verifies signatures locally, which means the private key never leaves the auth server and no secret has to be duplicated across the two deployments. Rotating the signing key requires no change to the API.

### Obtaining a Token — Client

`session.token` is an opaque signed string, **not** a JWT. A real JWT must be requested from the token endpoint:

```js
// src/lib/api.js
async function getToken() {
    if (cachedToken && Date.now() - cachedTokenAt < TOKEN_TTL) return cachedToken;

    const res = await fetch(`${base}/api/auth/token`, { credentials: "include" });
    const data = await res.json();
    cachedToken = data?.token || null;
    cachedTokenAt = Date.now();
    return cachedToken;
}
```

The token is cached for four minutes, so a dashboard rendering a dozen widgets issues a single token request rather than one per widget.

### Verifying a Token — Server

```js
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const JWKS_URL = `${process.env.FRONTEND_URL}/api/auth/jwks`;
let remoteJWKS = null;

function getRemoteJWKS() {
    if (!remoteJWKS) {
        remoteJWKS = createRemoteJWKSet(new URL(JWKS_URL), {
            cacheMaxAge: 10 * 60 * 1000,   // refetch the key set every 10 minutes
        });
    }
    return remoteJWKS;
}

async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    try {
        const { payload } = await jwtVerify(
            authHeader.split(" ")[1],
            getRemoteJWKS(),
            { issuer: process.env.FRONTEND_URL }
        );
        req.user = payload;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
}
```

### Role Guards

Roles are read from the database on every request rather than from the token payload. This costs one lookup, but it means revoking a role takes effect immediately instead of waiting for the existing token to expire.

```js
async function verifyAdmin(req, res, next) {
    const user = await usersCollection.findOne({ email: req.user?.email });
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
}

async function verifyDoctor(req, res, next) {
    const user = await usersCollection.findOne({ email: req.user?.email });
    if (!user || (user.role !== "doctor" && user.role !== "admin")) {
        return res.status(403).json({ error: "Forbidden: Doctors only" });
    }
    next();
}
```

Middleware composes left to right:

```js
app.get("/api/users",       verifyToken, verifyAdmin,  handler);  // admin only
app.post("/api/prescriptions", verifyToken, verifyDoctor, handler);  // doctor or admin
app.get("/api/doctors",     handler);                              // public
```

### Ownership Checks

Role alone is not sufficient, since one patient must never read another patient's records. Sensitive routes therefore compare the identity carried by the token against the owner of the requested resource:

```js
const user = await usersCollection.findOne({ email: req.user?.email });
const isAdmin = user?.role === "admin";

if (user?._id?.toString() !== patientId && !isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
}
```

### Privilege Escalation Prevention

The `POST /api/users` route is public so that registration can create a profile before a session exists. A whitelist prevents anyone from crafting a request that assigns themselves the administrator role:

```js
const allowedSelfRoles = ["patient", "doctor"];
const requestedRole = allowedSelfRoles.includes(role) ? role : null;

// an existing admin can never be downgraded either
if (existingUser.role !== "admin") { /* apply requestedRole */ }
```

Administrator access can therefore only be granted through direct database access, never through the API.

---

## Feature Compliance Matrix

Every mandatory challenge and the required minimum of optional features, mapped to
their implementation.

| Type | Requirement | Implementation |
|---|---|---|
| Challenge 1 | Advanced doctor search | MongoDB `$regex` with `$or` across `doctorName`, `specialization`, and `hospitalName` |
| Challenge 2 | Sorting functionality | Consultation fee ascending and descending, years of experience, and highest rating — combined with verified-first ordering through an aggregation pipeline |
| Challenge 3 | JWT token verification | Asymmetric JWKS verification, layered role guards, and per-resource ownership checks, documented in the section above |
| Challenge 4 | Pagination | Server-side `$skip` and `$limit` with total-count metadata on the Find Doctors page |
| Optional 2 | Doctor availability calendar | Doctors define their working days and time slots; the booking date picker enforces those constraints on both the client and the server |
| Optional 4 | Layout change option | Find Doctors switches between a card grid and a table view, and the table collapses into stacked cards on smaller screens |

## Engineering Notes

A few decisions in this codebase were less obvious than they appear, and are worth
recording.

**Serverless-safe database connection.** The MongoDB connection *promise* is cached
rather than its resolved result. Concurrent cold-start invocations then share a single
`connect()` call instead of racing one another. A gate middleware awaits that promise
before any route touches a collection, because without it a request arriving mid-connection
finds undefined collections and throws before CORS headers are ever written, which surfaces
in the browser as an opaque cross-origin failure rather than a real error.

**Payment integrity.** The confirmation endpoint never trusts the client's claim that a
payment succeeded. It re-fetches the PaymentIntent directly from Stripe and rejects any
status other than `succeeded`, then guards against replay by checking `transactionId`
against existing records.

**Rating consistency.** A doctor's `averageRating` and `totalReviews` are recalculated
inside every review create, update, and delete operation. This keeps the denormalised
values accurate without needing a scheduled job to reconcile them.

**Responsive tables.** Instead of forcing horizontal scrolling on small screens, each data
table renders twice: a stacked card list marked `md:hidden` and the full table marked
`hidden md:block`. Mobile users receive a layout designed for their viewport rather than a
desktop table squeezed into it.

**Avatar resolution.** `AuthContext` exposes a single `avatarUrl` value that prefers the
database `photo` field over the session `image`. A profile photo change therefore
propagates to the navbar, sidebar, and dashboard immediately, with no page reload required.

## Deployment

Both applications are deployed on Vercel as two independent projects. The environment
variables are identical to those listed in the Installation section, with the localhost
values replaced by the production URLs.

**Deployment checklist**

- MongoDB Atlas network access permits `0.0.0.0/0`, because Vercel assigns dynamic IP addresses
- `FRONTEND_URL` on the server matches the deployed client origin exactly, with no trailing slash, since it builds both the JWKS endpoint and the CORS allowlist
- The backend exports the Express application through `module.exports = app` and calls `listen()` only outside production
- `next.config.mjs` whitelists remote image hosts under `images.remotePatterns`
- Any change to an environment variable requires a fresh deployment, as Vercel does not reload them in place

## Author

**Salman Ibney Rahman**
[GitHub](https://github.com/salmanibneyrahman)

---