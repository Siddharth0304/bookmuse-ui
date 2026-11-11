import { useState } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useAll, useResource } from "@/hooks/api";
import { useAccount } from "@/components/SessionGate";
import QueryState from "@/components/QueryState";
import BookCover from "@/components/BookCover";
import Editor from "@/components/Editor";
import Confirm from "@/components/Confirm";
import { bookFields, libraryFields } from "@/features/fields";
import PostList from "@/features/PostList";
export default function BookPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const account = useAccount();
  const book = useResource("/books/" + id);
  const library = useAll("/me/library");
  const entry = library.data?.find((item) => item.bookId === id);
  const [edit, setEdit] = useState(null);
  const [remove, setRemove] = useState(null);
  return (
    <QueryState query={book}>
      {book.data && (
        <Stack gap={3}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "240px 1fr" },
              gap: 4,
            }}
          >
            <BookCover key={id} book={book.data} large />
            <Stack gap={2} alignItems="flex-start">
              <Typography variant="h3">{book.data.title}</Typography>
              <Typography color="text.secondary">{book.data.author}</Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {book.data.genres.map((genre) => (
                  <Chip key={genre} label={genre} />
                ))}
              </Stack>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {book.data.summary || "No summary provided."}
              </Typography>
              <QueryState query={library}>
                <Button variant="contained" onClick={() => setEdit("library")}>
                  {entry ? "Update reading status" : "Add to my library"}
                </Button>
                {entry && (
                  <Button color="error" onClick={() => setRemove("library")}>
                    Remove from library
                  </Button>
                )}
              </QueryState>
              {account.role === "ADMIN" && (
                <Stack direction="row" gap={1}>
                  <Button onClick={() => setEdit("book")}>Edit book</Button>
                  <Button color="error" onClick={() => setRemove("book")}>
                    Delete book
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
          <PostList bookId={id} />
        </Stack>
      )}
      {edit && (
        <Editor
          title={edit === "book" ? "Edit book" : "Your reading progress"}
          fields={edit === "book" ? bookFields : libraryFields}
          initial={edit === "book" ? book.data : entry || {}}
          path={edit === "book" ? "/books/" + id : "/me/library/" + id}
          method="PUT"
          onClose={() => setEdit(null)}
        />
      )}{" "}
      {remove && (
        <Confirm
          title={
            remove === "book"
              ? "Delete this book?"
              : "Remove from your library?"
          }
          description={
            remove === "book"
              ? "This permanently removes the book, all readers' library entries, posts, likes, shares, and comments about it."
              : "The book will be removed from your library."
          }
          path={remove === "book" ? "/books/" + id : "/me/library/" + id}
          onClose={() => setRemove(null)}
          onDone={remove === "book" ? () => navigate("/") : undefined}
        />
      )}
    </QueryState>
  );
}
