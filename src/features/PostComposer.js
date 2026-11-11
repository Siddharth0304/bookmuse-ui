import { useAll } from "@/hooks/api";
import QueryState from "@/components/QueryState";
import Editor from "@/components/Editor";
import { bodyFields } from "@/features/fields";
export default function PostComposer({ bookId, onClose }) {
  const books = useAll("/books");
  const fields = [
    {
      name: "bookId",
      label: "Book",
      required: true,
      options:
        books.data?.map((book) => [
          book.id,
          `${book.title}  -  ${book.author}`,
        ]) || [],
    },
    ...bodyFields,
  ];
  return (
    <QueryState
      query={books}
      count={books.data?.length}
      empty="No books are available. An administrator needs to add a book first."
    >
      {books.data && (
        <Editor
          title="Share a reading moment"
          fields={fields}
          initial={{ bookId: bookId || "" }}
          path="/posts"
          onClose={onClose}
        />
      )}
    </QueryState>
  );
}
