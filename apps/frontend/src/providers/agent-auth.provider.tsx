"use client";

import { setAccessTokenGetter, vanillaClient } from "@/utils/tsr";
import { isErrorResponse } from "@ts-rest/core";
import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

interface UserData {
  id: string;
  email: string;
  name: string;
}

export const AgentAuthContext = createContext<{
  jwtToken: string | null;
  setJwtToken: React.Dispatch<React.SetStateAction<string | null>>;
  userData: UserData | null;
  logout: () => void;
}>({
  jwtToken: null,
  setJwtToken: () => {},
  userData: null,
  logout: () => {},
});

export function AgentAuthProvider({ children }: { children: React.ReactNode }) {
  const [cookies, setCookie, removeCookie] = useCookies(["jwtToken"]);
  const [jwtToken, setJwtToken] = useState<string | null>(cookies.jwtToken);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  setAccessTokenGetter(() => {
    return jwtToken;
  });

  useEffect(() => {
    if (jwtToken && cookies.jwtToken !== jwtToken) {
      if (!jwtToken) {
        removeCookie("jwtToken");
      } else {
        setCookie("jwtToken", jwtToken, {
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }
    }

    setUserData(() => {
      if (jwtToken) {
        return jwtDecode(jwtToken);
      }
      return null;
    });
  }, [jwtToken, setCookie, removeCookie, cookies.jwtToken]);

  useEffect(() => {
    if (cookies.jwtToken) {
      vanillaClient.agent.auth
        .validateToken()
        .then(() => {
          setJwtToken(cookies.jwtToken);
          setUserData(jwtDecode(cookies.jwtToken));
        })
        .catch((error) => {
          if (isErrorResponse(error) && error.status === 401) {
            removeCookie("jwtToken");
            setJwtToken(null);
          }
        });
    }
  }, [cookies, removeCookie]);

  useEffect(() => {
    const isAuthRoute = pathname === "/agent/login";
    if (!jwtToken && !isAuthRoute && cookies.jwtToken === undefined) {
      router.push("/agent/login");
    }
    if (jwtToken && isAuthRoute) {
      router.push("/agent");
    }
  }, [jwtToken, pathname, router, cookies.jwtToken]);

  const logout = () => {
    setJwtToken(null);
    setUserData(null);
    removeCookie("jwtToken");
    router.push("/agent/login");
  };

  return (
    <AgentAuthContext.Provider
      value={{ jwtToken, setJwtToken, userData, logout }}
    >
      {children}
    </AgentAuthContext.Provider>
  );
}
