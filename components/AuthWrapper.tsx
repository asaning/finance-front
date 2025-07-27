import { router } from "expo-router";
import { ReactNode, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <>{children}</> : null;
}
