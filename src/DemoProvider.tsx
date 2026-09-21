import { useMemo, useReducer, type ReactNode } from "react";
import { DemoContext, initialState, reducer } from "./demo";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
