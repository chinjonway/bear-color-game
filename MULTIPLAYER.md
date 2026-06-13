# Bear Colour Quest — Multiplayer

## What was added
- **Solo / Host / Join** home screen
- **Real-time multiplayer** via Cloudflare Worker + Durable Objects (WebSocket Hibernation API)
- All players solve the **same secret** sequence independently
- **Leaderboard** at the end — fewer guesses = more points (1000 pts for 1 guess, −100 per extra guess, min 100)
- Host plays alongside players and can end the game early

## Backup
Original solo game: `bear-colour-game.backup.jsx`

## Deploy — Worker (do this first, once)

```bash
cd bear-color-game/worker
npm install
npx wrangler deploy
```

This deploys `bear-color-worker` to `https://bear-color-worker.jaydubberlieau.workers.dev`

## Deploy — Frontend

```bash
cd bear-color-game
npm run build
npx wrangler pages deploy dist --project-name bear-color-game
```

## Worker URL
Hardcoded in `src/useGameSocket.js`:
```js
const WORKER_URL = "https://bear-color-worker.jaydubberlieau.workers.dev";
```
Change this if you rename the worker.

## Game Flow
1. **Host** → Host a Game → enter nickname → room created with 6-letter code
2. **Players** → Join a Game → enter code + nickname → lobby
3. Host clicks **Start Game** → everyone gets bear count hints + guessing UI
4. Each player guesses privately — gets ✓ count feedback per guess
5. When all finish (or host clicks End Game) → secret revealed + leaderboard
6. Host can Play Again from results screen
