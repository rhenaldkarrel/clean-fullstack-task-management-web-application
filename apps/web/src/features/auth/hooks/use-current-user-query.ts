import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserApi } from "../api/auth-api";
import { useAuthSessionStore } from "../store/auth-session-store";

export function useCurrentUserQuery() {
  const accessToken = useAuthSessionStore((state) => state.accessToken);
  const setCurrentUser = useAuthSessionStore((state) => state.setCurrentUser);

  const query = useQuery({
    queryKey: ["auth", "me", accessToken],
    queryFn: getCurrentUserApi,
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (!accessToken) {
      setCurrentUser(null);
      return;
    }

    if (query.data) {
      setCurrentUser(query.data);
    }
  }, [accessToken, query.data, setCurrentUser]);

  return query;
}
