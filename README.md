# Board Decisions Archive

A modern web application for searching, browsing, and managing official board decisions. Built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Prisma with PostgreSQL.

> **Deploying?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step Vercel instructions.

## Features

- **Professional UI** — Clean navbar, hero section with search, responsive corporate design
- **Powerful Search** — Filter by date range, keywords (title/description/keywords), and subject matter
- **Decision Details** — Click any result to view full decision text in a modal
- **Add Decisions** — Form to record new board decisions
- **Browse All** — Paginated list with table (desktop) and cards (mobile)
- **Seeded Data** — 10 realistic sample board decisions included

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (e.g. Vercel Postgres, Neon, or Supabase — all have free tiers)

### Setup

```bash
cd board-decisions-archive
cp .env.example .env   # then fill in DATABASE_URL and DIRECT_URL
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Commands

```bash
npm run db:generate   # Generate Prisma client
npm run db:deploy     # Apply migrations to the database
npm run db:migrate    # Create a new migration (during development)
npm run db:seed       # Seed sample decisions
npm run db:setup      # Generate + deploy migrations + seed
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Prisma ORM + PostgreSQL
- **Hosting:** Vercel
- **UI Components:** Radix UI primitives, Lucide icons

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── actions/          # Server Actions
│   ├── search/           # Search page
│   ├── decisions/        # All decisions (paginated)
│   └── add/              # Add decision form
├── components/           # React components
│   └── ui/               # shadcn/ui components
└── lib/                  # Utilities, Prisma client, queries
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Sample data
```
