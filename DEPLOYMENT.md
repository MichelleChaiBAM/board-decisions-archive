# Deploying to Vercel

This app is a Next.js 15 project using Prisma + PostgreSQL. Follow these steps to
publish it at a public URL that anyone can use to search and view board decisions.

---

## 1. Create a hosted PostgreSQL database

Pick one (all have free tiers):

- **Vercel Postgres** — simplest, integrates directly in the Vercel dashboard
- **Neon** — https://neon.tech
- **Supabase** — https://supabase.com

You will get two connection strings (or one that you use for both):

| Variable       | Purpose                                   |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | Pooled connection used by the app         |
| `DIRECT_URL`   | Direct connection used to run migrations  |

> If your provider only gives one connection string, use it for **both**
> `DATABASE_URL` and `DIRECT_URL`.

---

## 2. Push the code to GitHub

```bash
cd board-decisions-archive
git init
git add .
git commit -m "Board Decisions Archive"
git branch -M main
git remote add origin https://github.com/<your-username>/board-decisions-archive.git
git push -u origin main
```

---

## 3. Import the project into Vercel

1. Go to https://vercel.com/new and import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Before deploying, add the **Environment Variables** below.

### Environment variables (add all four)

| Name                     | Value                                                        |
| ------------------------ | ------------------------------------------------------------ |
| `DATABASE_URL`           | your pooled Postgres URL                                     |
| `DIRECT_URL`             | your direct Postgres URL                                     |
| `ADMIN_EMAIL`            | `michelle.c@bam.org.my` (only this user can delete / attach PDFs) |
| `BLOB_READ_WRITE_TOKEN`  | Vercel Blob read/write token (required for PDF attachments)  |

The build command already runs migrations automatically:

```
prisma generate && prisma migrate deploy && next build
```

4. Click **Deploy**. Vercel will build the app and create the database tables.

---

## 4. Seed the sample data (one time)

After the first successful deploy, load the 26 subjects + sample decisions.
Run this locally with your **production** connection strings:

```bash
# Use the same DATABASE_URL / DIRECT_URL as production
npm install
npm run db:seed
```

(Or skip seeding and just add decisions through the app UI.)

---

## 5. Share the link

Vercel gives you a public URL like:

```
https://board-decisions-archive.vercel.app
```

Anyone with that link can **search, browse, and add** decisions.
Only the person who signs in with `ADMIN_EMAIL` can **delete** decisions
and **attach PDF files**.

### PDF attachments (Vercel Blob)

1. In the Vercel dashboard, open your project → **Storage** → **Create Database** → **Blob**.
2. Connect the store to this project so `BLOB_READ_WRITE_TOKEN` is added automatically.
3. Redeploy after connecting Blob.

Without this token, PDF uploads are not available in production.

---

## Local development (now uses PostgreSQL too)

SQLite is no longer used. For local dev, put your Postgres strings in `.env`
(you can reuse the hosted dev database), then:

```bash
npm install
npm run db:deploy   # apply migrations
npm run db:seed     # optional sample data
npm run dev
```

---

## Updating the admin email

Change the `ADMIN_EMAIL` environment variable in the Vercel dashboard
(Project → Settings → Environment Variables) and redeploy.
