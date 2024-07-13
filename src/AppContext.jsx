import { createContext, useContext } from "react";


const AppContext = createContext(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a CookieProvider");
  }
  return context;
};

export default AppContext;