import { Avatar, Card, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
export default function ReaderCard({ reader }) {
  return (
    <Card
      component={Link}
      to={"/users/" + reader.id}
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <Stack direction="row" gap={2}>
        <Avatar src={reader.avatarUrl || undefined}>
          {reader.name?.slice(0, 1)}
        </Avatar>
        <Stack gap={0.5}>
          <Typography fontWeight={600}>{reader.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {reader.booksRead} books read - {reader.followers} followers
          </Typography>
          <Typography variant="body2">
            {reader.bio || "No bio provided."}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
