"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface StoreUser {
  nombre:   string;
  email:    string;
  telefono: string;
}

interface Ctx {
  storeUser:    StoreUser | null;
  setStoreUser: (u: StoreUser | null) => void;
  logout:       () => void;
}

const StoreAuthCtx = createContext<Ctx>({
  storeUser:    null,
  setStoreUser: () => {},
  logout:       () => {},
});

export function StoreAuthProvider({ children }: { children: React.ReactNode }) {
  const [storeUser, setUser] = useState<StoreUser | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("elbiou_store_user");
      if (raw) setUser(JSON.parse(raw) as StoreUser);
    } catch {}
  }, []);

  function setStoreUser(u: StoreUser | null) {
    setUser(u);
    if (u) localStorage.setItem("elbiou_store_user", JSON.stringify(u));
    else   localStorage.removeItem("elbiou_store_user");
  }

  return (
    <StoreAuthCtx.Provider value={{ storeUser, setStoreUser, logout: () => setStoreUser(null) }}>
      {children}
    </StoreAuthCtx.Provider>
  );
}

export function useStoreAuth() { return useContext(StoreAuthCtx); }
