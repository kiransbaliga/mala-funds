# Mala Funds

An evidence-first, trustworthy civic-technology platform and data ingestion pipeline tracking MLA constituency-development funds (**LAC-ADS / MLA SDF**) and public development projects in **Mala, Kerala (Kodungallur LAC · 073)**.

---

## Overview

Mala Funds allows citizens, journalists, and researchers to track how public development money is allocated, tendered, executed, and spent.

### Core Principles
- **Evidence-First**: Every data point is grounded in public government records (Kerala e-Tender, Sulekha, Saankhya, Sakarma, KERI, PASK).
- **No Inferred Figures**: We never equate tender contract values with actual expenditure. Missing information is explicitly marked.
- **Geographic Precision**: Preserves strict distinctions between **Kodungallur LAC**, **Mala Block Panchayat**, and constituent Grama Panchayats (**Mala GP, Kuzhur GP, Poyya GP, Annamanada GP, Puthenchira GP**).
- **Multi-Source Reconciliation**: Entity resolution reconciles records across multiple government software systems while preserving verbatim scheme names (`scheme_original`).

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS (Civic Editorial Theme)
- **Charts**: Recharts
- **Database**: MongoDB Atlas (with serverless connection pooling)
- **Data Pipeline**: Python 3 ETL with fuzzy entity resolution (`collectors/`, `entity_resolution.py`)

---

## Getting Started

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:kiransbaliga/mala-funds.git
cd mala-funds
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your MongoDB Atlas connection string:
```bash
cp .env.example .env
```

### 3. Populate Database
You can populate data directly to MongoDB Atlas using Node.js or Python:

```bash
# Option A: Fast sync via Node.js
npm run sync

# Option B: Run full Python collectors & entity resolution
npm run collect
npm run sync:py
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Deployment (Vercel)

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the Environment Variable `MONGODB_URI` in Vercel project settings.
4. Deploy.
