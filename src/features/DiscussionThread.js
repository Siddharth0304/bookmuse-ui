import { Button, Card, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useState } from "react";
import { items, useCollection } from "@/hooks/api";
import ReaderLink from "@/components/ReaderLink";
import QueryState from "@/components/QueryState";
import Editor from "@/components/Editor";
import { bodyFields } from "@/features/fields";
export default function DiscussionThread({ discussion }) {
  const query = useCollection(`/discussions/${discussion.id}/replies`);
  const data = items(query);
  const [reply, setReply] = useState(false);
  return (
    <Stack gap={2}>
      <ReaderLink id={discussion.userId} />
      <Typography variant="h5">{discussion.title}</Typography>
      <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        {discussion.body}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {new Date(discussion.createdAt).toLocaleString()}
      </Typography>
      <Button onClick={() => setReply(true)} sx={{ alignSelf: "flex-start" }}>
        Write a reply
      </Button>
      <QueryState query={query} count={data.length} empty="No replies yet.">
        {data.map((item) => (
          <Card key={item.id} sx={{ p: 2, border: 1, borderColor: "divider" }}>
            <ReaderLink id={item.userId} />
            <Typography
              sx={{ my: 1, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {item.body}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(item.createdAt).toLocaleString()}
            </Typography>
          </Card>
        ))}
      </QueryState>
      {reply && (
        <Editor
          title="Reply to discussion"
          fields={bodyFields}
          path={`/discussions/${discussion.id}/replies`}
          onClose={() => setReply(false)}
        />
      )}
      <Button component={Link} to="/clubs">
        Browse clubs
      </Button>
    </Stack>
  );
}
