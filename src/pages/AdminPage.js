import { Alert } from "@mui/material";
import { useAccount } from "@/components/SessionGate";
import Administration from "@/features/Administration";
export default function AdminPage() {
  const account = useAccount();
  return account.role === "ADMIN" ? (
    <Administration />
  ) : (
    <Alert severity="error">Administrator access is required.</Alert>
  );
}
