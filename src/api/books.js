import { allPages } from "./client.js";

// The backend accepts one exact genre per request. Merge complete result sets
// so books that match more than one selection appear only once.
export async function findBooksByGenres(search, genres, signal) {
  const results = await Promise.all(
    [...new Set(genres)].map((genre) =>
      allPages("/books", { search, genre }, signal),
    ),
  );
  const unique = new Map(results.flat().map((book) => [book.id, book]));
  return [...unique.values()].sort(
    (a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id),
  );
}
