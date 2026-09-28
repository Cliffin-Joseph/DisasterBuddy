import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { logInWithEmail, logOut, observeSession, requestPasswordReset, signUpWithEmail } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [authState, setAuthState] = useState({
    status: isFirebaseConfigured ? 'loading' : 'preview',
    user: null,
    error: null,
  });

  const retrySession = useCallback(() => {
    setAuthState({ status: 'loading', user: null, error: null });
    setSessionAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    return observeSession(
      (observedUser) => {
        const isSignedInUser = observedUser && !observedUser.isAnonymous;
        setAuthState({
          status: isSignedInUser ? 'ready' : 'signedOut',
          user: isSignedInUser ? observedUser : null,
          error: null,
        });
      },
      (error) => {
        setAuthState({ status: 'error', user: null, error });
      },
    );
  }, [sessionAttempt]);

  const login = useCallback(async (email, password) => {
    const signedInUser = await logInWithEmail(email, password);
    setAuthState({ status: 'ready', user: signedInUser, error: null });
    return signedInUser;
  }, []);

  const signUp = useCallback(async (displayName, email, password) => {
    const newUser = await signUpWithEmail(displayName, email, password);
    setAuthState({ status: 'ready', user: newUser, error: null });
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await logOut();
    setAuthState({ status: 'signedOut', user: null, error: null });
  }, []);

  const contextValue = useMemo(() => ({
    ...authState,
    retry: retrySession,
    isFirebaseConfigured,
    login,
    signUp,
    resetPassword: requestPasswordReset,
    logout,
  }), [authState, retrySession, login, signUp, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
