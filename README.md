# PolyRadar

Polymarket trader analytics dashboard built with Next.js.

## Live App

- Production: `https://poly-radar.vercel.app/`

## Features

- Trader leaderboard with ranking views
- Wallet analytics (positions, activity, PnL)
- Side-by-side wallet comparison
- Fast API routes with cache + upstream timeouts

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest + ESLint

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks Before Deploy

```bash
npm run lint
npm run test
npm run build
```

## Vercel Deployment

This repository is Vercel-ready.

1. Import the GitHub repo in Vercel
2. Keep default Next.js settings
3. Deploy

No environment variables are required for core functionality.

## API Endpoints

- `GET /api/leaderboard`
- `GET /api/wallet/[address]`

## Data Source

- Public Polymarket Data API (`https://data-api.polymarket.com`)
