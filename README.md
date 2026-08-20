# BuildMart Marketplace — Phase 1 MVP

Marketplace วัสดุก่อสร้างแบบ Multi-Supplier พัฒนาด้วย Next.js 16, TypeScript, Tailwind CSS, Auth.js/NextAuth, Prisma และ PostgreSQL

## Features

- Marketplace homepage, categories, search และ product detail
- Dynamic product specifications และ bulk pricing
- Local cart prototype, checkout, Bank Transfer/QR/Corporate Credit UI
- Supplier onboarding + API validation
- Customer, Supplier และ Admin dashboards
- Prisma schema: RBAC, supplier, catalog, attributes, warehouse, inventory, orders, payments
- NextAuth Google และ Email/Password credentials scaffold

## Local setup

```bash
cp .env.example .env
npm install
npx prisma generate
npm run dev
```

เปิด http://localhost:3000

## PostgreSQL

1. สร้าง PostgreSQL บน Neon, Supabase หรือผู้ให้บริการ Cloud PostgreSQL
2. ใส่ connection string ใน `DATABASE_URL`
3. รัน `npm run db:push`

## Authentication

กำหนด `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` ใน `.env` และ Environment Variables ของผู้ให้บริการ Hosting

## Deploy to Netlify

1. Push repository ขึ้น GitHub
2. Import repository ใน Netlify
3. เชื่อม PostgreSQL และกำหนด Environment Variables
4. ตั้ง `NEXT_PUBLIC_APP_URL` เป็น URL Production ของ Netlify
5. Deploy โดย Build Command ใช้ `npm run build` และ Publish directory ใช้ `.next`

ค่าที่ต้องกำหนดบน Netlify:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Production checklist

- เชื่อม Form กับ API และ PostgreSQL จริง
- เพิ่ม email verification, password reset, rate limit และ MFA สำหรับ Admin
- เชื่อม Payment Gateway/QR webhook และตรวจ signature
- ใช้ object storage สำหรับรูปสินค้า เอกสารบริษัท และสลิป
- เพิ่ม audit log, inventory reservation transaction และ order status history
