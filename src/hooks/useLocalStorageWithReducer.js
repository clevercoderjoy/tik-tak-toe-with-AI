import { useEffect, useReducer } from "react";

const useLocalStorageWithReducer = (key, reducer, initialState) => {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        const parsedStored = JSON.parse(stored);
        return { ...initialState, ...parsedStored };
      }
      return typeof initialState === "function" ? initialState() : initialState;
    } catch (error) {
      console.log(error);
      return typeof initialState === "function" ? initialState() : initialState;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.log(error);
    }
  }, [key, state]);
  return [state, dispatch];
};

export default useLocalStorageWithReducer;
