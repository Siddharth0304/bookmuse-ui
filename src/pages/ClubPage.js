import { useParams } from "react-router-dom";
import ClubDetail from "@/features/ClubDetail";
export default function ClubPage() {
  const { id } = useParams();
  return <ClubDetail key={id} id={id} />;
}
