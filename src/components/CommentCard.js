import { useState } from "react";
import { Button, Card, Stack, Typography } from "@mui/material";
import { useAccount } from "@/components/SessionGate";
import ReaderLink from "@/components/ReaderLink";
import Editor from "@/components/Editor";
import Confirm from "@/components/Confirm";
import { bodyFields } from "@/features/fields";
export default function CommentCard({ comment }) {
  const account = useAccount();
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  return (
    <Card sx={{ p: 2, border: 1, borderColor: "divider" }}>
      <Stack gap={1}>
        <ReaderLink id={comment.userId} />
        <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
          {comment.body}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleString()}
        </Typography>
        {account.id === comment.userId && (
          <Stack direction="row">
            <Button size="small" onClick={() => setEdit(true)}>
              Edit
            </Button>
            <Button size="small" color="error" onClick={() => setRemove(true)}>
              Delete
            </Button>
          </Stack>
        )}
      </Stack>
      {edit && (
        <Editor
          title="Edit comment"
          fields={bodyFields}
          initial={comment}
          path={"/comments/" + comment.id}
          method="PUT"
          onClose={() => setEdit(false)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Delete comment?"
          description="This permanently removes your comment."
          path={"/comments/" + comment.id}
          onClose={() => setRemove(false)}
        />
      )}
    </Card>
  );
}
