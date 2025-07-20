import { useState, useEffect } from "react";

function useLocalStorageState(key, defaultValue) {
  // Lazy initializer to avoid reading localStorage on every render
  const [state, setState] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
      // If defaultValue is a function, call it
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    } catch (e) {
      console.log(e);
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.log(e);
    }
  }, [key, state]);

  return [state, setState];
}

export default useLocalStorageState;
