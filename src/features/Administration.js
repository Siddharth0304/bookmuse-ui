import { useState } from "react";
import {
  Button,
  Card,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { items, useCollection } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import Editor from "@/components/Editor";
import Confirm from "@/components/Confirm";
import { bookFields } from "@/features/fields";
export default function Administration() {
  const [tab, setTab] = useState("books");
  const books = useCollection("/books", {}, tab === "books");
  const users = useCollection("/admin/users", {}, tab === "users");
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const query = tab === "books" ? books : users;
  const data = items(query);
  return (
    <Stack gap={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">Administration</Typography>
        {tab === "books" && (
          <Button variant="contained" onClick={() => setEditor({})}>
            Add book
          </Button>
        )}
      </Stack>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab value="books" label="Catalogue" />
        <Tab value="users" label="Accounts" />
      </Tabs>
      <QueryState
        query={query}
        count={data.length}
        empty={
          tab === "books"
            ? "No books yet. Add the first book to your catalogue."
            : "No accounts found."
        }
      >
        {data.map((item) => (
          <Card key={item.id} sx={{ p: 3, border: 1, borderColor: "divider" }}>
            {tab === "books" ? (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={2}
                alignItems={{ sm: "center" }}
              >
                <Stack sx={{ flex: 1 }}>
                  <Typography
                    component={Link}
                    to={"/books/" + item.id}
                    variant="h5"
                    color="primary.main"
                  >
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.author}</Typography>
                </Stack>
                <Button onClick={() => setEditor(item)}>Edit</Button>
                <Button
                  color="error"
                  onClick={() =>
                    setConfirm({
                      title: "Delete this book?",
                      description:
                        "This permanently removes the book, all library entries, posts, likes, shares, and comments about it.",
                      path: "/books/" + item.id,
                    })
                  }
                >
                  Delete
                </Button>
              </Stack>
            ) : (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={2}
                alignItems={{ sm: "center" }}
              >
                <Stack sx={{ flex: 1 }}>
                  <Typography
                    component={Link}
                    to={"/users/" + item.id}
                    color="primary.main"
                    fontWeight={600}
                  >
                    {item.name}
                  </Typography>
                  <Typography color="text.secondary">{item.email}</Typography>
                </Stack>
                <Chip label={item.role} />
                <Chip
                  label={item.blocked ? "Blocked" : "Active"}
                  color={item.blocked ? "error" : "success"}
                  variant="outlined"
                />
                {item.role === "USER" && (
                  <Button
                    color={item.blocked ? "primary" : "error"}
                    onClick={() =>
                      setConfirm({
                        title: item.blocked
                          ? "Reactivate account?"
                          : "Block this account?",
                        description: item.blocked
                          ? "The reader can sign in again. Previous sessions remain revoked."
                          : "The reader will immediately lose access and all refresh tokens will be revoked.",
                        path: `/admin/users/${item.id}/status`,
                        method: "PUT",
                        body: { blocked: !item.blocked },
                      })
                    }
                  >
                    {item.blocked ? "Reactivate" : "Block"}
                  </Button>
                )}
              </Stack>
            )}
          </Card>
        ))}
      </QueryState>
      {editor && (
        <Editor
          title={editor.id ? "Edit book" : "Add a book"}
          fields={bookFields}
          initial={editor}
          path={editor.id ? "/books/" + editor.id : "/books"}
          method={editor.id ? "PUT" : "POST"}
          onClose={() => setEditor(null)}
        />
      )}{" "}
      {confirm && <Confirm {...confirm} onClose={() => setConfirm(null)} />}
    </Stack>
  );
}
