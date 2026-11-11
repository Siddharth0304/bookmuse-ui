import { useState } from "react";
import { Button, Card, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { items, useCollection } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import Editor from "@/components/Editor";
import { clubFields } from "@/features/fields";
export default function ClubsPage() {
  const query = useCollection("/clubs");
  const data = items(query);
  const [create, setCreate] = useState(false);
  return (
    <Stack gap={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Find your reading circle.</Typography>
        <Button variant="contained" onClick={() => setCreate(true)}>
          Create club
        </Button>
      </Stack>
      <Typography color="text.secondary">
        A shared book is the beginning of a good conversation.
      </Typography>
      <QueryState
        query={query}
        count={data.length}
        empty="No clubs yet. Start a circle of your own."
      >
        {data.map((club) => (
          <Card key={club.id} sx={{ p: 3, border: 1, borderColor: "divider" }}>
            <Typography
              component={Link}
              to={"/clubs/" + club.id}
              variant="h5"
              sx={{ color: "primary.main", textDecoration: "none" }}
            >
              {club.name}
            </Typography>
            <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
              {club.description || "No description provided."}
            </Typography>
            <Button component={Link} to={"/clubs/" + club.id} sx={{ mt: 1 }}>
              Visit club
            </Button>
          </Card>
        ))}
      </QueryState>
      {create && (
        <Editor
          title="Create a book club"
          fields={clubFields}
          path="/clubs"
          onClose={() => setCreate(false)}
        />
      )}
    </Stack>
  );
}
