# 🌟 AlphaVerse — Safe Social Network for Kids

> Built on TYF Network | Next.js 14 + Supabase + Tailwind CSS

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase URL, keys, and Resend API key
```

### 3. Set up Supabase database
- Go to supabase.com → your project → SQL Editor
- Run the entire contents of `supabase/schema.sql`

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 App Router + React 18 |
| Styling | Tailwind CSS + AlphaVerse Design System |
| Database | Supabase (PostgreSQL) |
| Auth | Custom session cookies + bcrypt |
| Fonts | Fredoka One (headings) + Nunito (body) |
| Deployment | Vercel |

## 📁 Project Structure

```
src/
├── app/
│   ├── login/          # Unified login (student/parent/register/admin)
│   ├── (kid)/          # Kid app shell + pages
│   │   ├── home/       # Feed page
│   │   ├── chat/       # Direct messaging
│   │   ├── communities/# Community list + detail
│   │   ├── challenges/ # Challenges & submissions
│   │   ├── friends/    # Friend list
│   │   └── profile/    # User profile
│   ├── parent/         # Parent portal
│   │   ├── dashboard/  # Overview + approvals
│   │   ├── posts/      # Post moderation
│   │   ├── activity/   # Child activity
│   │   └── settings/   # PIN setup
│   ├── admin/          # Admin panel
│   └── api/            # All API routes
├── lib/
│   ├── supabase/       # Supabase client helpers
│   └── types.ts        # TypeScript types
supabase/
└── schema.sql          # Database schema + seed data
```

## 🛡️ Features

- **Student Accounts**: Register with parent approval, post content, chat, join communities
- **Parent Portal**: Approve/reject posts, monitor activity, password + PIN login
- **Communities**: 10 default communities (Gaming, Art, Science, Music, etc.)
- **Challenges**: Kids earn points by completing challenges
- **Admin Panel**: Manage all posts, users, and create challenges
- **Safety First**: All posts require parent approval before going live

## 🔐 Environment Variables

See `.env.example` for all required variables.
