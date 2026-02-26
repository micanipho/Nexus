"use client";

import React, { useReducer, useContext, useMemo, useEffect } from "react";
import { AuthContext, AuthActionsContext, initialState } from "./context";
import authReducer from "./reducer";
import * as actions from "./actions";
import { authService } from "../../services/authService";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const authActions = useMemo(
    () => ({
      login: async (email: string, password: string) => {
        dispatch(actions.authLoginRequest());
        try {
          const result = await authService.login(email, password);
          localStorage.setItem("nexus_token", result.token);
          dispatch(actions.authLoginSuccess(result));
        } catch (error: any) {
          dispatch(actions.authLoginFailure(error.message || "Login failed"));
          throw error;
        }
      },
      register: async (
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        tenantName?: string,
        tenantId?: string,
        role?: string,
      ) => {
        dispatch(actions.authRegisterRequest());
        try {
          const result = await authService.register(
            firstName,
            lastName,
            email,
            password,
            tenantName,
            tenantId,
            role,
          );
          localStorage.setItem("nexus_token", result.token);
          dispatch(actions.authRegisterSuccess(result));
        } catch (error: any) {
          dispatch(
            actions.authRegisterFailure(error.message || "Registration failed"),
          );
          throw error;
        }
      },
      logout: async () => {
        await authService.logout();
        localStorage.removeItem("nexus_token");
        dispatch(actions.authLogout());
        globalThis.location.href = '/login';
      },
      checkAuth: async () => {
        const token = localStorage.getItem("nexus_token");
        if (token) {
          try {
            const user = await authService.getCurrentUser();
            dispatch(actions.authSetUser(user));
          } catch (error) {
            localStorage.removeItem("nexus_token");
            dispatch(actions.authSetUser(null));
          }
        }
      },
    }),
    [dispatch],
  );

  useEffect(() => {
    authActions.checkAuth();
  }, [authActions]);

  return (
    <AuthContext.Provider value={state}>
      <AuthActionsContext.Provider value={authActions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return context;
};
