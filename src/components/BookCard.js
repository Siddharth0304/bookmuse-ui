import { Box, Chip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import BookCover from "@/components/BookCover";
export default function BookCard({ book, entry }) {
  return (
    <Box>
      <Box
        component={Link}
        to={`/books/${book.id}`}
        sx={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          "&:hover": { transform: "translateY(-3px)" },
          transition: "transform .2s",
        }}
      >
        <BookCover book={book} />
        <Typography
          variant="caption"
          color="primary.main"
          sx={{
            display: "block",
            mt: 1.5,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {book.genres?.join("  -  ")}
        </Typography>
        <Typography fontWeight={600} sx={{ mt: 0.5 }}>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
      </Box>
      {entry && (
        <Chip
          size="small"
          sx={{ mt: 1 }}
          label={
            entry.status === "READ"
              ? "Finished"
              : entry.status === "READING"
                ? `Reading${entry.progress != null ? "  -  " + entry.progress + "%" : ""}`
                : "Want to read"
          }
        />
      )}
    </Box>
  );
}
