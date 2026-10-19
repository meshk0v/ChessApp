# Chess Battle — Telegram Mini App

Real-time online chess that runs inside Telegram as a Mini App ([@Chess_Battle_Bot](https://t.me/Chess_Battle_Bot)).

## Features

- Play against a random opponent or invite a friend via a Telegram share link
- Time controls from 1 to 60 minutes, with server-synced clocks
- Move validation with [chess.js](https://github.com/jhlywa/chess.js), pawn promotion, last-move highlighting
- Draw offers, resignation, rematches and in-game emotions
- Leaderboard and player profile with rating
- TON wallet connection via TON Connect
- Telegram integration: user data from `initData`, haptic feedback, back button

## Tech stack

React 18 · React Router 6 · Socket.IO client · chess.js · TON Connect UI · Lottie · Create React App

## Getting started

```bash
npm install
cp .env.example .env
npm start
```

The app runs at http://localhost:3000. To test it inside Telegram, expose the dev server through a tunnel (e.g. ngrok) and set that URL as the bot's Mini App URL in [@BotFather](https://t.me/BotFather). The settings in `.env.example` let the dev server work behind a tunnel.

Production build:

```bash
npm run build
```

## Backend

The app needs a separate Node.js backend (Express + Socket.IO + PostgreSQL) for matchmaking, game state, ratings and Telegram avatars. The backend URL `https://chess-battle.space` is hardcoded in `src/socket.js` and in the components that call the API. Change it there to use your own server.

## Project structure

```
src/
├── components/
│   ├── Lobby/         # game search, invitations, time selection
│   ├── GameBoard/     # board, clocks, player info, modals
│   ├── Leaderboard/
│   ├── Profile/       # rating, TON wallet
│   ├── MarketPlace/
│   ├── BottomNav/
│   └── SplashScreen/
├── assets/            # chess piece SVGs, Lottie animation
└── socket.js          # Socket.IO connection
```
