import { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import { items, useCollection } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import PostCard from "@/components/PostCard";
import PostComposer from "@/features/PostComposer";
export default function PostList({ bookId }) {
  const query = useCollection("/posts", bookId ? { bookId } : {});
  const data = items(query);
  const [compose, setCompose] = useState(false);
  return (
    <Stack gap={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">
          {bookId ? "Around this book" : "Between the pages"}
        </Typography>
        <Button variant="contained" onClick={() => setCompose(true)}>
          Write a post
        </Button>
      </Stack>
      <QueryState
        query={query}
        count={data.length}
        empty="No posts yet. Share the first reading moment."
      >
        {data.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </QueryState>
      {compose && (
        <>
          <Button onClick={() => setCompose(false)}>Cancel writing</Button>
          <PostComposer bookId={bookId} onClose={() => setCompose(false)} />
        </>
      )}
    </Stack>
  );
}
