# 🏍️ TrackMoto — Bike Workshop Management System
> **প্রিমিয়াম বাইক ওয়ার্কশপ ম্যানেজমেন্ট সফটওয়্যার**  
> দৈনিক হিসাব শিট (Daily Sheet), ডায়নামিক খরচ (Dynamic Expenses), মাসিক প্রফিট সামারি (Monthly Summary), কাস্টমার কিস্তি বাকি ও দ্বিমুখী লেনদেন খাতা (Bidirectional Due & Installments).

---

## 🌟 প্রধান ফিচারসমূহ (Key Features)

### 1. 📅 দৈনিক হিসাব শিট (Daily Service & Expense Sheet)
- **সার্ভিস ও সেলস এন্ট্রি:** তারিখ, গ্রাহকের নাম, মোবাইল, বাইক মডেল, রেজি নং, সার্ভিসিং মজুরি (Service Charge), স্পেয়ার পার্টস (Spare Parts), ইঞ্জিন অয়েল (Engine Oil), অতিরিক্ত ফি (Extra) যোগ হয়ে স্বয়ংক্রিয়ভাবে মোট বিল হিসাব।
- **ডায়নামিক খরচ (Multiple Dynamic Expenses):** দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর মজুরি, মালামাল ক্রয় বা নাস্তা—প্রতিটি খরচ বিবরণ ও ক্যাটাগরিসহ আনলিমিটেড এন্ট্রি।
- **দৈনিক নিট হিসাব:** `মোট আয় - মোট খরচ = আজকের নিট প্রফিট / ব্যালেন্স`।
- তারিখ পরিবর্তন ও ক্যালেন্ডার নেভিগেশন।

### 2. 📊 মাসিক প্রফিট ও ক্ষতি বিবরণী (Monthly Summary Report)
- জানুয়ারি থেকে ডিসেম্বর প্রতি মাসের মোট ইনকাম, মোট ব্যয় এবং নিট অবশিষ্ট স্বয়ংক্রিয়ভাবে হিসাব।
- বাৎসরিক গ্রস ইনকাম, টোটাল এক্সপেন্স ও নিট লাভের ওভারভিউ কার্ড।
- এক ক্লিকে **Excel Sheet (.xlsx)** ডাউনলোড ও এক্সপোর্ট সুবিধা।

### 3. 💳 কাস্টমার বাকি ও কিস্তি খাতা (Customer Dues & Installments)
- সার্ভিস বিলের সময় আংশিক বা ফুল বাকি থাকলে স্বয়ংক্রিয়ভাবে কাস্টমার বাকি খাতায় রেকর্ড তৈরি এবং **মূল বিক্রয়/সার্ভিসের সাথে লিংক স্থাপন**।
- **কিস্তি পরিশোধ ট্র্যাকিং (Installments with Dates):** গ্রাহক কবে কত টাকা (নগদ, বিকাশ, নগদ) পরিশোধ করেছে তার বিস্তারিত তারিখসহ হিস্টোরি।
- অবশিষ্ট বাকি শূন্য হলে স্বয়ংক্রিয়ভাবে **"পরিশোধিত (CLEARED)"** স্ট্যাটাস আপডেট।
- পরিশোধের মেয়াদ উত্তীর্ণ (Overdue) হলে লাল সতর্কবার্তা।

### 4. ⚖️ দ্বিমুখী বাকি ও পাওনা খাতা (Bidirectional Due Ledger)
- **আমরা দেবো (We Owe Them):** পার্টস সাপ্লায়ার, দোকান মালিকের বাকি পাওনা।
- **আমরা পাবো (They Owe Us):** যাদের কাছে আমাদের পাওনা।
- একই কোম্পানি বা ব্যক্তির উভয় লেনদেনের বিপরীতে **সমন্বিত নিট ব্যালেন্স (Net Position)** প্রদর্শনী।

### 5. 📦 অতিরিক্ত সুবিধাসমূহ
- **গ্রাহক ডেটাবেজ (Customer CRM):** গ্রাহকের বাইকের তালিকা, লাইফটাইম খরচের পরিমাণ ও বাকি তথ্য।
- **পার্টস ইনভেন্টরি (Stock & Parts):** ইঞ্জিন অয়েল, ব্রেক শু, চেইনের ক্রয়মূল্য, বিক্রয়মূল্য ও লো-স্টক সতর্কবার্তা।
- **প্রিন্ট-রেডি ক্যাশ মেমো (Printable Invoices):** ওয়ার্কশপ হেডারসহ যেকোনো সার্ভিসের অফিশিয়াল বিল ও মেমো প্রিন্ট।
- **ডেমো ডাটা সিডার:** এক ক্লিকে বাস্তবসম্মত নমুনা ডাটা লোড ও টেস্টিং সুবিধা।

---

## 🛠️ প্রযুক্তিগত কাঠামো (Tech Stack)

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript |
| **Database** | Neon Lakebase Postgres (Serverless) / PostgreSQL 16 |
| **ORM** | Prisma ORM |
| **Styling** | Tailwind CSS v3 / shadcn design tokens |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Export** | SheetJS (xlsx) |
| **Container** | Docker & Docker Compose |
| **Deployment** | Vercel (Production) & Neon Cloud |

---

## 🚀 লোকাল রান করার নিয়ম (Local Development)

### অপশন ১: সরাসরি Node.js দিয়ে
```bash
# ১. ডিপেন্ডেন্সি ইনস্টল
npm install

# ২. প্রিজমা ক্লায়েন্ট তৈরি
npx prisma generate

# ৩. লোকাল ডেটাবেজ পুশ
npx prisma db push

# ৪. ডেভেলপমেন্ট সার্ভার চালু
npm run dev
```
ব্রাউজারে ভিজিট করুন: `http://localhost:3000`

---

### অপশন ২: Docker দিয়ে
```bash
# ডকার কন্টেইনার এবং লোকাল পোস্টগ্রেস চালু
docker-compose up -d --build
```
ব্রাউজারে ভিজিট করুন: `http://localhost:3000`

---

## ☁️ Neon ক্লাউড ও Vercel এ ডেপ্লয়মেন্ট

### ১. Neon কনফিগারেশন
Neon CLI দ্বারা প্রোজেক্ট ইতিমধ্যে লিংক করা আছে:
- **Project ID:** `bitter-queen-63727945`
- **Org ID:** `org-wispy-hill-06699806`
- **Branch:** `production`

ক্লাউডে সার্ভিস প্রোভিশন ও লাইভ এনভায়রনমেন্ট পেতে:
```bash
neon login
neon deploy
```
*(এটি স্বয়ংক্রিয়ভাবে `.env.local` ফাইলে প্রোডাকশন `DATABASE_URL` যুক্ত করবে)*

### ২. GitHub ও Vercel এ ডেপ্লয়
```bash
git init
git add .
git commit -m "feat: complete TrackMoto workshop management system"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```
তারপর [Vercel](https://vercel.com) এ গিয়ে গিটহাব রিপোজিটরিটি ইমপোর্ট করুন এবং Environment Variable হিসেবে `DATABASE_URL` সেট করে Deploy বাটনে ক্লিক করুন।
