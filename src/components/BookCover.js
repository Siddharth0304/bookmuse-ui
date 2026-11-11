import { useState } from "react";
import { Box } from "@mui/material";
import { BookOpen } from "lucide-react";
export default function BookCover({ book, large = false }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return (
    <Box
      sx={{
        height: large ? 300 : 230,
        bgcolor: "action.hover",
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      {book.coverUrl && book.coverUrl !== failedUrl ? (
        <Box
          component="img"
          src={book.coverUrl}
          alt={`${book.title} cover`}
          onError={() => setFailedUrl(book.coverUrl)}
          sx={{
            maxWidth: "100%",
            height: "100%",
            objectFit: "contain",
            borderRadius: 1,
            boxShadow: 3,
          }}
        />
      ) : (
        <BookOpen size={large ? 64 : 40} aria-label="No cover available" />
      )}
    </Box>
  );
}
