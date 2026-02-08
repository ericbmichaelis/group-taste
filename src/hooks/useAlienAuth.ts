import { useEffect, useState } from "react";
import { useAuth } from "@alien_org/sso-sdk-react";

export interface AlienUser {
  id: string;
  name: string;
  verified: boolean;
}

interface UserInfo {
  name?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

export function useAlienAuth() {
  const { auth, openModal, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Try to fetch userinfo when we get a token
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.token) {
      setUserInfo(null);
      return;
    }

    const baseUrl = import.meta.env.VITE_SSO_BASE_URL || "https://sso.alien-api.com";
    fetch(`${baseUrl}/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUserInfo(data);
      })
      .catch(() => {
        // userinfo endpoint not available, that's ok
      });
  }, [auth.isAuthenticated, auth.token]);

  const userId = auth.tokenInfo?.sub ?? "";
  const displayName =
    userInfo?.preferred_username ||
    userInfo?.name ||
    userInfo?.email ||
    (userId ? `Alien ${userId.slice(-6).toUpperCase()}` : "");

  return {
    isAuthenticated: auth.isAuthenticated,
    user: auth.isAuthenticated
      ? ({
          id: userId,
          name: displayName,
          verified: true,
        } as AlienUser)
      : null,
    signIn: openModal,
    signOut: logout,
  };
}
