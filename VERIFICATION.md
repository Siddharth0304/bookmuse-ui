# Frontend verification

- `npm test`: 13 client tests passed.
- `npm run build`: production build passed. Vite reports a non-fatal main-chunk size advisory.
- `npm run test:ui`: 11 headless Microsoft Edge browser tests passed against intercepted HTTP responses matching the documented backend contract. The suite reused the production preview server.
- Browser coverage includes authentication gating/logout; no browser storage writes; catalogue search, filters and pagination; recommendations; library progress/removal; post and comment CRUD; likes/unlike/shares; clubs, discussions, replies, creator actions and membership; profiles and follow state; accounts and book administration; notifications and discussion discovery; missing/forbidden/invalid requests; all-page relationships; mobile overflow; and light/dark switching without browser errors.
- Production source audit found no test fixtures, sample records, sample covers, browser persistence or TypeScript files.

These are frontend contract checks, not live backend integration tests. Test transport fixtures are isolated under `tests/` and are not imported by the app. The backend was unreachable at `http://localhost:8080`; real CORS, authentication, database persistence, permissions and PostgreSQL behavior still require verification with the running backend. See `../bookmuse/docs/VERIFICATION.md` for backend-side constraints.

For this Windows sandbox, start `npm run preview` in a separate terminal before running the browser suite, which reuses it. Automatic test-owned server teardown can hang under the restricted process environment. Vite development dependency optimization also encounters parent-directory access restrictions here; production build and preview are usable.
