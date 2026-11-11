import { createTheme } from "@mui/material/styles";
export const lightPalette = {
  primary: { main: "#70415e" },
  secondary: { main: "#596e55" },
  background: { default: "#f8f7f4", paper: "#ffffff" },
  text: { primary: "#29262b", secondary: "#6b646d" },
  divider: "#eae6e8",
};
export const darkPalette = {
  primary: { main: "#d6a7c4" },
  secondary: { main: "#a4b99c" },
  background: { default: "#19171c", paper: "#242128" },
  text: { primary: "#f3edf2", secondary: "#b6acb6" },
  divider: "#3a333d",
};
export const getTheme = (mode) =>
  createTheme({
    palette: { mode, ...(mode === "light" ? lightPalette : darkPalette) },
    typography: {
      fontFamily: '"Segoe UI", sans-serif',
      h3: { fontFamily: "Georgia, serif", fontWeight: 500 },
      h4: { fontFamily: "Georgia, serif", fontWeight: 500 },
      h5: { fontFamily: "Georgia, serif", fontWeight: 500 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 8, padding: "10px 18px" } },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            boxShadow: "none",
            border: "1px solid",
            borderColor: theme.palette.divider,
          }),
        },
      },
    },
  });
