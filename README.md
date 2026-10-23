# 🏍️ TrackMoto — Bike Workshop Management System
> **Premium Bike Workshop Management & Financial Accounting Platform**  
> Daily Service & Dynamic Expense Tracking, Monthly Profit/Loss Summaries, Customer Installment Due Ledger, and Bidirectional Supplier/Vendor Accounting.

---

## 🌟 Key Features

### 1. 📅 Daily Service & Expense Sheet (`/daily`)
- **Income Entry:** Customer Name, Phone, Bike Model, Registration No, Service Labour Charge, Spare Parts, Engine Oil, and Extra Charges — automatically summed into Total Bill.
- **Dynamic Expenses:** Add multiple separate expense items per day (Rent, Utilities, Parts Purchase, Staff Refreshments, etc.) with custom descriptions and categories.
- **Daily Net Total:** Real-time calculation: `Total Daily Income - Total Daily Expenses = Net Daily Profit / Balance`.
- **Date Navigation:** Instant date switcher to browse and log records for any date.

### 2. 📊 Monthly Summary & Profit Report (`/monthly`)
- Comprehensive overview across all 12 months (January to December).
- Automatic calculation of gross income, total expenses, and resulting net profit or loss.
- High-level annual overview cards.
- **One-click Excel Export:** Download complete monthly accounting reports into `.xlsx`.

### 3. 💳 Customer Dues & Installment Ledger (`/dues/customers`)
- **Direct Linkage to Sales:** Automatically generated whenever a service is marked as "Due" or "Partial", linking directly to the original service record (`serviceId`).
- **Installment Payment History:** Log date-wise installment payments (Cash, bKash, Nagad) with balance tracking.
- **Auto-Clearing:** Automatically flips to `CLEARED` status when the remaining balance reaches zero.
- **Overdue Alerts:** Visual badges for dues exceeding their deadline.

### 4. ⚖️ Bidirectional Due & Pay Ledger (`/dues`)
- **We Owe (Payable):** Track money the workshop owes to suppliers and vendors with payment logs.
- **They Owe Us (Receivable):** Track money owed to the workshop by corporate clients and partners.
- **Party Net Balance:** Automatically calculates net balance for entities appearing on both sides.

### 5. 📦 Additional Modules
- **Customer Directory & CRM (`/customers`):** History of customer bikes, lifetime spend, and active dues.
- **Stock & Parts Inventory (`/inventory`):** Stock tracker with buy price, sell price, and low-stock warnings.
- **Printable Invoices (`/invoices`):** Clean, print-ready cash memos for customers.
- **One-Click Demo Seeder:** Instantly populate realistic sample data via the header button.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript |
| **Database** | Neon Lakebase Postgres (Serverless) / PostgreSQL 16 |
| **ORM** | Prisma ORM |
| **Styling** | Tailwind CSS / Modern card design tokens |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Export** | SheetJS (xlsx) |
| **Container** | Docker & Docker Compose |
| **Deployment** | Vercel & Neon Cloud |

---

## 🚀 Running Locally

Create a local environment file and set its placeholder values before starting the app:
```bash
cp .env.example .env
```
Use a strong, unique `NEXTAUTH_SECRET` and `POSTGRES_PASSWORD`. Keep `.env` private and out of version control.

### Option 1: Direct Node.js Run
```bash
# 1. Install dependencies
npm install

# 2. Set DATABASE_URL in .env to your PostgreSQL connection string
# 3. Push database schema
npx prisma db push

# 4. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 2: Run with Docker Compose
Set `POSTGRES_PASSWORD` and `NEXTAUTH_SECRET` in `.env` first. Compose uses the database password for its internal database connection.
```bash
# Start Next.js and PostgreSQL containers
docker compose up -d --build
```
Open [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment Guide

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: complete TrackMoto workshop platform in English"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trackmoto.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Set Environment Variable:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
3. Click **Deploy**.
