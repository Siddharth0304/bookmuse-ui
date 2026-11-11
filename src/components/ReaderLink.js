import { Avatar, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useResource } from "@/hooks/api";
export default function ReaderLink({ id }) {
  const query = useResource("/users/" + id, !!id);
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar
        src={query.data?.avatarUrl || undefined}
        sx={{ width: 30, height: 30, fontSize: 13 }}
      >
        {query.data?.name?.slice(0, 1)}
      </Avatar>
      <Typography
        component={Link}
        to={`/users/${id}`}
        variant="body2"
        sx={{ color: "primary.main", textDecoration: "none" }}
      >
        {query.data?.name ||
          (query.isError ? "Reader unavailable" : "Loading reader...")}
      </Typography>
    </Stack>
  );
}
