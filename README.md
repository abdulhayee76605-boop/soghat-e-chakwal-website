# Soghat-e-Chakwal — Premium Pakistani Food E-Commerce Platform

A production-quality, cinematic e-commerce website built for **Soghat-e-Chakwal** (*From Farm to Fork*). Inspired by the agricultural heritage of Chakwal, Punjab, and the beloved slogan *"Wohi Purana Desi Zaiqa, Ab Har Ghar Mein!"*.

---

## 🌿 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, 100% typecheck clean)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with brand color tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & CSS keyframe kinetics
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database / Backend**: Built-in memory seed store for demo; complete [Supabase](https://supabase.com/) SQL schema included in `supabase/schema.sql`

---

## 🎨 Brand Design System

| Color | Hex | Role |
|---|---|---|
| **Deep Forest Green** | `#103D2A` | Primary brand tone, editorial depth |
| **Heritage Gold** | `#D4A437` | Accent highlights, buttons, badges |
| **Warm Cream** | `#FFF8E9` | Ambient cards, warm backgrounds |
| **Soft Ivory** | `#F9F5EC` | Primary page canvas |
| **Dark Charcoal** | `#222822` | Typography & night contrasts |
| **Muted Terracotta** | `#A85B36` | Subheadings & labels |

---

## 🚀 Getting Started

### 1. Development Mode
To start the development server on `localhost:3000`:
```bash
npm run dev
```

### 2. Production Build & Start
```bash
npm run build
npm start
```

### 3. Admin Portal Access
Navigate to:
```
http://localhost:3000/admin
```
- **Demo Password**: `admin123` (or `soghat`)
- Features: Inventory control, real-time sales metrics, order status tracking, and delivery settings.

---

## 📦 Key Pages & Routes

- `/` — Cinematic Homepage (Hero, Featured Products, Family Story, Farm-to-Fork process, Why Choose Us)
- `/shop` — Store catalog with multi-category expansion pills
- `/products/mustard-oil` — Product Detail page (1L & 500ml variants, dynamic packaging renderers, Accordion tabs, sticky mobile bar)
- `/cart` — Full shopping cart with shipping progress bar
- `/checkout` — Comprehensive Pakistani checkout form with Cash on Delivery & Direct Bank Transfer
- `/order-confirmation` — Order tracking code, timeline, and WhatsApp follow-up
- `/our-story` — Brand narrative celebrating Chakwal's Potohar heritage
- `/our-process` — 4-stage transparent production breakdown
- `/contact` — Interactive message form, helpline, and verified store address
- `/privacy-policy`, `/shipping-policy`, `/return-policy`, `/terms` — Comprehensive customer policy documents
- `/admin` — Protected administrative dashboard
- `/api/orders` — REST endpoint for creating and updating orders

---

## 📱 WhatsApp Integration

- **Official Business Number**: `+92 300 8325693`
- Direct message generators automatically encode product name, selected bottle size, unit price, quantity, and customer delivery requirements.
- Floating WhatsApp button with pulsing beacon is active across all pages.

---

## 🗄️ Supabase Deployment (Optional Production DB)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and execute the script in `supabase/schema.sql`.
3. Copy your project URL and service keys into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
