# AGENTS.md

Guidelines for AI coding agents working on this project's frontend.

## Tech Stack

| Concern        | Library                                   |
| -------------- | ----------------------------------------- |
| Build tool     | Vite                                      |
| UI framework   | React (with JavaScript)                   |
| Routing        | `react-router-dom`                        |
| Component lib  | MUI (`@mui/material`, `@mui/icons-material` is **not** used) |
| Icons          | `lucide-react`                            |
| Server state   | `@tanstack/react-query`                   |
| Theming        | MUI theme with light and dark modes       |

Do not use Create React App, Next.js, or Webpack. This is a Vite + React single-page app.

Do not introduce alternative libraries for these concerns (e.g. Redux for server state, Font Awesome, Tailwind, styled-components for new UI) without explicit approval.

## Build Tool (Vite + React)

- The project is scaffolded with Vite using the React JavaScript template (`npm create vite@latest -- --template react`).
- Use the official `@vitejs/plugin-react` plugin in `vite.config.js`.
- Use the standard scripts: `npm run dev`, `npm run build`, `npm run preview`.
- Environment variables must be prefixed with `VITE_` and read via `import.meta.env.VITE_*` (never `process.env`).
  - Keep secrets out of `VITE_` variables, since they are exposed to the browser.
  - Document every variable in `.env.example`.
- Set up a path alias (e.g. `@` -> `src`) in both `vite.config.js` and `jsconfig.json`, and use it for imports.
- Put static assets that need no processing in `public/`. Import all other assets from `src/` so Vite can hash and optimize them.
- For SPA routing, configure the host to fall back to `index.html` for unknown paths. Use a dev proxy (`server.proxy`) for API calls instead of hard-coding backend URLs.
- Use dynamic `import()` / `React.lazy` for code splitting, and `build.rollupOptions.output.manualChunks` only if bundle analysis shows a need.
- Keep the entry point at `src/main.js`, which renders `<App />` wrapped by the providers (ThemeProvider, QueryClientProvider, RouterProvider).

## Routing (react-router-dom)

- Use `react-router-dom` for all navigation. Never use `window.location` or raw `<a href>` for in-app links.
- Define routes centrally (e.g. `src/routes/index.js`) using `createBrowserRouter` and `RouterProvider`.
- Use `<Link>` / `<NavLink>` for links and `useNavigate` for programmatic navigation.
- Lazy-load page-level components with `React.lazy` and wrap in `Suspense`.
- Use nested routes and a shared layout component with `<Outlet />`.
- Keep a catch-all `*` route for a 404 page.
- Protect private routes with a wrapper/layout route, not per-page checks.

## UI Components (MUI)

- Build all UI with MUI components (`Button`, `TextField`, `Dialog`, `Table`, `Stack`, `Box`, `Typography`, etc.).
- Use the `sx` prop or `styled()` for styling. Avoid inline `style` and plain CSS files for component styling.
- Use theme tokens instead of hard-coded values: `theme.palette.*`, `theme.spacing()`, `theme.breakpoints`, `theme.typography`.
- Never hard-code colors like `#fff` or `#000`. Use `text.primary`, `background.paper`, `divider`, `primary.main`, etc., so both themes work.
- Use `Grid`/`Stack`/`Box` for layout and MUI breakpoints for responsiveness.
- Customize component defaults globally via `components` overrides in the theme, not repeatedly per usage.

## Icons (lucide-react)

- Use `lucide-react` for all icons. Do not use `@mui/icons-material` or other icon packs.
- Import icons individually by name:

  ```jsx
  import { Search, Moon, Sun } from "lucide-react";
  ```

- Size and color via props, and inherit color from the theme:

  ```jsx
  <Search size={20} color="currentColor" />
  ```

- For icon-only buttons, use MUI `IconButton` wrapping a Lucide icon, and always provide an `aria-label`.

## Data Fetching (React Query)

- Use `@tanstack/react-query` for all server state (fetching, caching, mutations). Do not fetch in `useEffect` + `useState`.
- Create a single `QueryClient` and wrap the app in `QueryClientProvider`.
- Write reusable hooks per resource (e.g. `useUsers`, `useCreateUser`) in a `src/api` or `src/hooks` folder.
- Use stable, hierarchical query keys, ideally from a key factory:

  ```js
  export const userKeys = {
    all: ["users"],
    list: (filters) => [...userKeys.all, "list", filters],
    detail: (id) => [...userKeys.all, "detail", id],
  };
  ```

- Use `useMutation` for writes and invalidate related queries in `onSuccess`.
- Always handle `isLoading`, `isError`, and empty states in the UI (MUI `Skeleton`, `CircularProgress`, `Alert`).
- Keep API calls in a separate service layer (e.g. `src/api/client.js`), not inside components.

## Theming: Light and Dark Mode

Both themes are **required**. Every screen and component must look correct in light and dark mode.

- Create the theme with MUI's `createTheme` and `palette.mode` set to `"light"` or `"dark"`.
- Wrap the app in `ThemeProvider` and include `CssBaseline`.
- Keep the theme choice in memory and default to the OS preference via `prefers-color-scheme`. Do not use browser storage.
- Expose a theme context/hook (e.g. `useColorMode`) with a toggle, and provide a toggle button in the app bar (Lucide `Sun` / `Moon` icons).
- Define palettes in one place (`src/theme/`) with separate `lightPalette` and `darkPalette`.
- Rules for components:
  - Use only theme palette values for colors.
  - Check contrast in both modes (WCAG AA).
  - Images/illustrations with fixed backgrounds must have a dark-mode variant or transparent background.
  - Avoid a flash of the wrong theme on load by resolving the mode before first render.

Example structure:

```jsx
// src/theme/index.js
import { createTheme } from "@mui/material/styles";

export const getTheme = (mode) =>
  createTheme({
    palette: { mode /* ...mode-specific palette */ },
    shape: { borderRadius: 8 },
  });
```

## Suggested Project Structure

```
index.html
vite.config.js
.env.example
public/
src/
  main.js      # Entry point and providers
  App.js
  api/          # API client and React Query hooks
  components/   # Reusable UI components
  features/     # Feature-based modules
  hooks/        # Shared hooks (useColorMode, etc.)
  layouts/      # Layout components using <Outlet />
  pages/        # Route-level components
  routes/       # Router configuration
  theme/        # MUI theme, palettes, ThemeProvider
  utils/
```

## Code Conventions

- Use JavaScript only. All new source and configuration files must use `.js`, including React components with JSX. Do not add `.ts`, `.tsx`, or TypeScript dependencies.
- Functional components and hooks only.
- One component per file, named in PascalCase.
- Keep components small; extract logic into hooks.
- Add accessible labels, alt text, and keyboard support.

## Checklist Before Finishing a Task

- [ ] Works with `npm run dev` and `npm run build` (Vite)
- [ ] Env vars use the `VITE_` prefix and `import.meta.env`
- [ ] Uses `react-router-dom` for navigation
- [ ] Uses MUI components and theme tokens (no hard-coded colors)
- [ ] Uses `lucide-react` icons only
- [ ] Server data handled with React Query (loading, error, empty states)
- [ ] Verified in both light and dark mode
- [ ] Responsive on mobile and desktop
- [ ] No JavaScript or lint errors

## Backend-only data requirement

- All product data must come from the documented BookMuse backend endpoints. Do not add demo/sample records, localStorage/sessionStorage persistence, offline data fallbacks, hard-coded book/reader/club content, or external sample cover URLs.
- Keep authentication tokens and query caches in memory. Each tab has its own session. Reloading requires sign-in.
- Do not persist theme state locally; follow the OS preference and keep user toggles in memory.
- Test fixtures may exist only under `tests/` and must never be imported into production application code.
- Use the endpoint coverage map in `API_INTEGRATION.md` when changing backend integrations.
