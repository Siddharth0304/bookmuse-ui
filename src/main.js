import { Suspense, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { getTheme } from "@/theme";
import { ColorMode } from "@/theme/ColorMode";
import { router } from "@/routes";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        ![401, 403, 404].includes(error.status) && count < 1,
      staleTime: 30000,
    },
    mutations: { retry: false },
  },
});
function Root() {
  const system = useMediaQuery("(prefers-color-scheme: dark)");
  const [choice, setChoice] = useState(null);
  const dark = choice ?? system;
  const theme = useMemo(() => getTheme(dark ? "dark" : "light"), [dark]);
  return (
    <ColorMode.Provider value={{ dark, toggle: () => setChoice(!dark) }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={client}>
          <Suspense
            fallback={
              <CircularProgress aria-label="Loading page" sx={{ m: 4 }} />
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </QueryClientProvider>
      </ThemeProvider>
    </ColorMode.Provider>
  );
}
createRoot(document.getElementById("root")).render(<Root />);
