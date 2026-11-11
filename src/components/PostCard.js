import { useState } from "react";
import { Button, Card, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { useAction, useResource } from "@/hooks/api";
import { useAccount } from "@/components/SessionGate";
import ReaderLink from "@/components/ReaderLink";
import ActionError from "@/components/ActionError";
import Editor from "@/components/Editor";
import Confirm from "@/components/Confirm";
import { bodyFields } from "@/features/fields";
export default function PostCard({ post, detail = false, onDeleted }) {
  const account = useAccount();
  const book = useResource("/books/" + post.bookId);
  const action = useAction();
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  return (
    <Card sx={{ p: 3, border: 1, borderColor: "divider" }}>
      <Stack gap={2}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <ReaderLink id={post.userId} />
          <Typography variant="caption" color="text.secondary">
            {new Date(post.createdAt).toLocaleString()}
          </Typography>
        </Stack>
        <Typography
          component={Link}
          to={`/books/${post.bookId}`}
          color="primary.main"
          variant="body2"
        >
          {book.data?.title ||
            (book.isError ? "Book unavailable" : "Loading book...")}
        </Typography>
        <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {post.body}
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            size="small"
            startIcon={<Heart size={16} />}
            disabled={action.isPending}
            onClick={() => action.mutate({ path: `/posts/${post.id}/like` })}
          >
            Like - {post.likes}
          </Button>
          <Button
            size="small"
            disabled={action.isPending}
            onClick={() =>
              action.mutate({
                path: `/posts/${post.id}/like`,
                method: "DELETE",
              })
            }
          >
            Remove like
          </Button>
          <Button
            size="small"
            component={Link}
            to={`/posts/${post.id}`}
            startIcon={<MessageCircle size={16} />}
          >
            {post.comments} comments
          </Button>
          <Button
            size="small"
            disabled={action.isPending}
            startIcon={<Share2 size={16} />}
            onClick={() =>
              action.mutate({
                path: `/posts/${post.id}/shares`,
                method: "POST",
              })
            }
          >
            Share - {post.shares}
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Like totals are refreshed from BookMuse. Sharing records an in-app
          share event.
        </Typography>
        {action.isSuccess && (
          <Typography variant="caption" color="success.main">
            Saved to BookMuse.
          </Typography>
        )}
        <ActionError action={action} />
        {post.userId === account.id && (
          <Stack direction="row">
            <Button size="small" onClick={() => setEdit(true)}>
              Edit post
            </Button>
            <Button size="small" color="error" onClick={() => setRemove(true)}>
              Delete post
            </Button>
          </Stack>
        )}
        {!detail && (
          <Button
            component={Link}
            to={`/posts/${post.id}`}
            sx={{ alignSelf: "flex-start" }}
          >
            Open conversation
          </Button>
        )}
      </Stack>
      {edit && (
        <Editor
          title="Edit your post"
          fields={bodyFields}
          initial={post}
          path={"/posts/" + post.id}
          method="PUT"
          onClose={() => setEdit(false)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Delete this post?"
          description="The post and all its likes, shares, and comments will be permanently removed."
          path={"/posts/" + post.id}
          onClose={() => setRemove(false)}
          onDone={onDeleted}
        />
      )}
    </Card>
  );
}
