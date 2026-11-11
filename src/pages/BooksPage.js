import { useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Check, ChevronDown, Search, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  items,
  useAll,
  useBooksByGenres,
  useCollection,
  useResource,
} from "@/hooks/api";
import QueryState from "@/components/QueryState";
import BookCard from "@/components/BookCard";
import LibraryBook from "@/components/LibraryBook";
export default function BooksPage({ mode = "discover" }) {
  const [search, setSearch] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [filters, setFilters] = useState({ search: "", genres: [] });
  const profile = useResource("/me");
  const catalogue = useAll("/books", mode === "discover");
  const genres = [
    ...new Set((catalogue.data || []).flatMap((book) => book.genres)),
  ].sort((a, b) => a.localeCompare(b));
  const path =
    mode === "library"
      ? "/me/library"
      : mode === "recommendations"
        ? "/me/recommendations"
        : "/books";
  const multiGenre = mode === "discover" && filters.genres.length > 1;
  const singleQuery = useCollection(
    path,
    mode === "discover"
      ? { search: filters.search, genre: filters.genres[0] || "" }
      : {},
    !multiGenre,
  );
  const multiQuery = useBooksByGenres(
    filters.search,
    filters.genres,
    multiGenre,
  );
  const query = multiGenre ? multiQuery : singleQuery;
  const data = multiGenre ? multiQuery.data || [] : items(singleQuery);
  return (
    <Stack gap={3}>
      <Box>
        <Typography
          variant="overline"
          color="primary.main"
          sx={{ letterSpacing: 2 }}
        >
          YOUR NEXT CHAPTER
        </Typography>
        <Typography variant="h4">
          {mode === "library"
            ? "Your personal bookshelf"
            : mode === "recommendations"
              ? "A little more your kind of story."
              : `Good to see you${profile.data?.name ? ", " + profile.data.name : ""}.`}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          {mode === "library"
            ? "The stories you have saved, started, and loved."
            : mode === "recommendations"
              ? "Recommendations from your favourite genres and reading history."
              : "Discover a book. Find a new perspective."}
        </Typography>
      </Box>
      {mode === "discover" && (
        <Card
          sx={{
            p: { xs: 3, md: 4 },
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Sparkles />
          <Typography variant="h3" sx={{ my: 2, fontSize: { xs: 32, sm: 42 } }}>
            A world of stories.
            <br />A place to belong.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Your reading life, a little more connected.
          </Typography>
          <Button
            component={Link}
            to="/recommendations"
            variant="contained"
            color="secondary"
          >
            Find a book for me
          </Button>
        </Card>
      )}
      {mode === "discover" && (
        <Stack
          component="form"
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({
              search: search.trim(),
              genres: [...selectedGenres].sort(),
            });
          }}
        >
          <TextField
            label="Search title or author"
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Autocomplete
            multiple
            popupIcon={<ChevronDown size={18} />}
            clearIcon={<X size={16} />}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...props } = getItemProps({ index });
                return (
                  <Chip
                    key={option}
                    {...props}
                    size="small"
                    label={option}
                    deleteIcon={<X size={14} />}
                  />
                );
              })
            }
            disableCloseOnSelect
            options={genres}
            value={selectedGenres}
            onChange={(_, value) => setSelectedGenres(value)}
            disabled={catalogue.isPending || catalogue.isError}
            loading={catalogue.isPending}
            noOptionsText="No matching genres"
            size="small"
            sx={{ width: { xs: "100%", sm: 300 }, flexShrink: 0 }}
            renderOption={(props, option, { selected }) => {
              const { key, ...optionProps } = props;
              return (
                <Box component="li" key={key} {...optionProps} sx={{ gap: 1 }}>
                  <Box sx={{ width: 18, display: "flex" }}>
                    {selected && <Check size={18} />}
                  </Box>
                  {option}
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Genres"
                placeholder={
                  selectedGenres.length ? "Search genres" : "All genres"
                }
                helperText={
                  catalogue.isPending
                    ? "Loading genres..."
                    : "Matches any selected genre"
                }
              />
            )}
          />
          <Button type="submit" variant="contained">
            Search
          </Button>
          <Button
            onClick={() => {
              setSearch("");
              setSelectedGenres([]);
              setFilters({ search: "", genres: [] });
            }}
          >
            Reset
          </Button>
        </Stack>
      )}
      {mode === "discover" && catalogue.isError && (
        <Alert
          severity="error"
          action={<Button onClick={() => catalogue.refetch()}>Retry</Button>}
        >
          Could not load genres. {catalogue.error.message}
        </Alert>
      )}
      <QueryState
        query={query}
        count={data.length}
        empty={
          mode === "library"
            ? "Your library is empty. Discover a book and save it to get started."
            : "No books found."
        }
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2,minmax(0,1fr))",
              sm: "repeat(3,minmax(0,1fr))",
              lg: "repeat(4,minmax(0,1fr))",
              xl: "repeat(5,minmax(0,1fr))",
            },
            gap: 3,
          }}
        >
          {data.map((item) =>
            mode === "library" ? (
              <LibraryBook key={item.id} entry={item} />
            ) : (
              <BookCard key={item.id} book={item} />
            ),
          )}
        </Box>
      </QueryState>
    </Stack>
  );
}
