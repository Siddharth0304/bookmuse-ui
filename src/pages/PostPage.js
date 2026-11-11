import { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { items, useCollection, useResource } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import PostCard from "@/components/PostCard";
import CommentCard from "@/components/CommentCard";
import Editor from "@/components/Editor";
import { bodyFields } from "@/features/fields";
export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const query = useResource("/posts/" + id);
  const comments = useCollection(`/posts/${id}/comments`, {}, !!query.data);
  const data = items(comments);
  const [reply, setReply] = useState(false);
  return (
    <QueryState query={query}>
      {query.data && (
        <Stack gap={3}>
          <Typography variant="h4">The conversation</Typography>
          <PostCard
            post={query.data}
            detail
            onDeleted={() => navigate("/community")}
          />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="h5">Comments</Typography>
            <Button onClick={() => setReply(true)}>Add a comment</Button>
          </Stack>
          <QueryState
            query={comments}
            count={data.length}
            empty="Be the first to join the conversation."
          >
            {data.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </QueryState>
        </Stack>
      )}
      {reply && (
        <Editor
          title="Add a comment"
          fields={bodyFields}
          path={`/posts/${id}/comments`}
          onClose={() => setReply(false)}
        />
      )}
    </QueryState>
  );
}
