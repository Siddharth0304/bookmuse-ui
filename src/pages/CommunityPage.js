import { Stack, Typography } from "@mui/material";
import PostList from "@/features/PostList";
export default function CommunityPage() {
  return (
    <Stack gap={3}>
      <Typography variant="h4">Good stories bring us together.</Typography>
      <Typography color="text.secondary">
        Fresh thoughts and shared perspectives from the BookMuse community.
      </Typography>
      <PostList />
    </Stack>
  );
}
