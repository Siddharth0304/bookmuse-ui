import { useResource } from "@/hooks/api";
import BookCard from "@/components/BookCard";
import QueryState from "@/components/QueryState";
export default function LibraryBook({ entry }) {
  const book = useResource("/books/" + entry.bookId);
  return (
    <QueryState query={book}>
      {book.data && <BookCard book={book.data} entry={entry} />}
    </QueryState>
  );
}
