import { useParams } from "react-router-dom";
import { useAccount } from "@/components/SessionGate";
import ProfileDetail from "@/features/ProfileDetail";
export default function ProfilePage() {
  const { id } = useParams();
  const account = useAccount();
  return (
    <ProfileDetail
      key={id || account.id}
      id={id || account.id}
      own={!id || id === account.id}
    />
  );
}
