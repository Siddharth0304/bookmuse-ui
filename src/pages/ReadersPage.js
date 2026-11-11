import { Stack, Typography } from "@mui/material";
import { items, useCollection } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import ReaderCard from "@/components/ReaderCard";
export default function ReadersPage() {
  const query = useCollection("/users");
  const data = items(query);
  return (
    <Stack gap={3}>
      <Typography variant="h4">Meet your kind of book people.</Typography>
      <Typography color="text.secondary">
        Discover readers and the stories that connect you.
      </Typography>
      <QueryState query={query} count={data.length} empty="No readers found.">
        {data.map((reader) => (
          <ReaderCard key={reader.id} reader={reader} />
        ))}
      </QueryState>
    </Stack>
  );
}
