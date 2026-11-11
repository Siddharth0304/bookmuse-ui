import { createContext, useContext } from "react";
export const ColorMode = createContext({ dark: false, toggle: () => {} });
export const useColorMode = () => useContext(ColorMode);
