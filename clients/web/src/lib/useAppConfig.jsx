import { useContext } from "react";
import { AppConfigContext } from "./AppContext.jsx";

export const useAppConfig = () => useContext(AppConfigContext);
