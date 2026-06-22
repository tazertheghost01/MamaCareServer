# MamaCare Admin Dashboard

Next.js 14 + Tailwind CSS admin panel.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Pages built

| Page | File | API |
|------|------|-----|
| Dashboard | `app/dashboard/page.jsx` | `GET /api/v1/home/summary` |
| Users | `app/users/page.jsx` | (placeholder — no user list endpoint yet) |

## Auth

The layout reads `mc_token` and `mc_user` from `localStorage`.  
After your login flow sets these, all protected API calls will include the Bearer token automatically.

## Structure

```
app/
  layout.jsx           ← root layout with AdminLayout shell
  dashboard/page.jsx   ← Dashboard
  users/page.jsx       ← Users
components/
  layout/
    Sidebar.jsx        ← nav sidebar
    Topbar.jsx         ← top bar with search, bell, user avatar
    AdminLayout.jsx    ← wraps sidebar + topbar
  StatCard.jsx         ← reusable stat card
```
