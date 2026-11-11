# BookMuse UI

A backend-driven Vite + React application. JavaScript only, with MUI, Lucide, React Router and React Query.

## Run

```sh
npm install
npm run dev
```

Start the BookMuse backend separately at `http://localhost:8080`. Open `http://localhost:5173` and register or sign in with a backend account. The frontend never seeds accounts or books. An administrator can add books in Administration.

`/api` is proxied to the backend during development. Vite uses port 5173 strictly so it matches the backend's allowed origin. Copy `.env.example` to `.env.local` only to override the public `VITE_API_BASE_URL`; the default is `/api`. Never put secrets in frontend environment variables.

Production hosting must forward `/api` to the backend and serve `index.html` for unknown SPA routes. Local production preview also proxies `/api` for backend integration testing.

## Data and sessions

All catalogue, profile, account, library, recommendation, social, club, notification and administration data comes from the backend. There are no runtime fixtures, demo modes, sample covers, browser database records, or offline data fallbacks. Covers and avatars use URLs supplied by the backend, with neutral placeholders when absent or broken.

Tokens and query caches live only in memory in each tab. A reload requires sign-in again. Tabs do not share tokens, so each tab has an independent refresh lifecycle. Refresh calls are serialized within each tab, use `expiresIn`, atomically replace the token pair, and retry a rejected request once. Invalid refresh/blocked sessions return to sign-in and clear cached account data. Network/server refresh failures retain the session for a deliberate retry. Sign-out waits for token rotation, revokes the current refresh token, then clears the session and query cache. If revocation fails, the error is visible and sign-out can be retried.

Light/dark mode starts with the OS preference. The toggle is in-memory only; the app writes no localStorage or sessionStorage data.

## Integrated workflows

- Registration, login, refresh, logout and account/role loading.
- Catalogue title/author search, exact-genre filter, detail and paginated recommendations.
- Library add/update/remove, reading status and integer progress.
- Readers, public/own profiles, profile updates, public libraries, follow/unfollow and follower/following lists.
- Community posts and book-specific feeds; post/comment create, read, owner edit and delete; likes, unlike and share events.
- Club create, detail, creator edit/delete, membership, member lists, discussions and replies.
- Notifications, unread count polling, individual/all read actions and activity navigation.
- Admin catalogue create/update/delete and user blocking/reactivation. Admin controls do not bypass ownership or club membership rules.

All visible collections support loading, errors, empty states and backend pagination. Relationship checks and discussion discovery traverse all pages. Mutations invalidate related server caches. Non-idempotent writes are never automatically retried after ambiguous network failures. Destructive operations explain backend cascades before confirmation.

The API does not expose `likedByMe`; the UI offers explicit Like and Remove like actions and refetches counts rather than inventing a toggle state. The searchable Discover genre menu supports multiple selections and derives unique sorted options from every backend catalogue page. Selected genres match with OR semantics; since the backend accepts one genre, the client fetches every page for each selection and merges matching books by ID. Profile and book editors accept genre labels. Reply notifications omit club context, so activity navigation discovers the discussion through accessible clubs and handles deleted/inaccessible targets. No unsupported password-reset, file-upload or discussion-editing actions are offered.

See [API_INTEGRATION.md](API_INTEGRATION.md) for the endpoint-to-screen map.

## Verification

```sh
npm test
npm run build
npm run test:ui
npm run preview
```

The browser suite uses installed Microsoft Edge in headless mode and a built production preview. Test-only transport fixtures live under `tests/ui/`; they are never imported by the application or bundled into `dist`. These check browser behavior against the documented HTTP contract and are not a substitute for live backend verification.

The runner config loader avoids a Windows sandbox restriction affecting Vite's default config bundling. Dependency optimization in `npm run dev` can still encounter restricted parent-directory access inside this sandbox; production build/preview work here.

The backend was not reachable on port 8080 during implementation. Live authentication, CORS, PostgreSQL persistence, cascade behavior and backend permission enforcement therefore still require a running backend and database. Backend verification constraints are recorded in `../bookmuse/docs/VERIFICATION.md`.
