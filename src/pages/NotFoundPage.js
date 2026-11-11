import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <Stack gap={2}>
      <Typography variant="h4">Page not found</Typography>
      <Button component={Link} to="/">
        Return to discover
      </Button>
    </Stack>
  );
}
