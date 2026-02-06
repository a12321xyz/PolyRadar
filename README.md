# PolyRadar

PolyRadar is a Next.js app for Polymarket analytics:

- leaderboard browsing
- wallet analytics (positions, activity, PnL)
- wallet-vs-wallet comparison

## Local Development

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Deploying to Vercel

This project is ready for zero-config Vercel deployment.

1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Use defaults:
   - Framework preset: `Next.js`
   - Build command: `npm run build`
   - Output: `.next`
4. Deploy.

No environment variables are required for core functionality.

## Notes

- Data is fetched from public Polymarket Data API endpoints.
- Upstream API calls are cached and protected with request timeouts for better production reliability.
