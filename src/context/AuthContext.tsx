import React, { createContext, useContext, useMemo, useState } from 'react';

interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

interface AuthContextValue {
  user: User | null;
  setUser: (u: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({ uid: 'demo', email: 'demo@example.com', displayName: 'Demo User' });
  const value = useMemo(() => ({ user, setUser }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return { user: { uid: 'fallback', email: 'user@example.com' }, setUser: () => {} };
  }
  return ctx;
}
