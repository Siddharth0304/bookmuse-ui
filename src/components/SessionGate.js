import { createContext, useContext, useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useResource, useSession } from "@/hooks/api";
import QueryState from "@/components/QueryState";
const Account = createContext(null);
export const useAccount = () => useContext(Account);
export default function SessionGate() {
  const session = useSession();
  const client = useQueryClient();
  const location = useLocation();
  const previous = useRef(session);
  const account = useResource("/me/account", !!session);
  useEffect(() => {
    if (previous.current && !session) {
      client.cancelQueries();
      client.clear();
    }
    previous.current = session;
  }, [session, client]);
  if (!session)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return (
    <QueryState query={account}>
      {account.data && (
        <Account.Provider value={account.data}>
          <Outlet />
        </Account.Provider>
      )}
    </QueryState>
  );
}
