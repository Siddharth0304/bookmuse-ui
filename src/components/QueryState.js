import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
export default function QueryState({ query, children, empty, count }) {
  if (query.isPending && query.fetchStatus !== "idle")
    return (
      <Box sx={{ p: 4, textAlign: "center" }} role="status">
        <CircularProgress size={28} />
        <Typography sx={{ mt: 1 }}>Loading...</Typography>
      </Box>
    );
  if (query.isError)
    return (
      <Alert
        severity="error"
        sx={{ my: 2, whiteSpace: "pre-wrap" }}
        action={<Button onClick={() => query.refetch()}>Retry</Button>}
      >
        {query.error.status === 404
          ? "This resource no longer exists."
          : query.error.status === 403
            ? "You do not have permission to view this content."
            : query.error.message}
      </Alert>
    );
  if (count === 0)
    return (
      <Box
        sx={{
          p: 4,
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary">
          {empty || "Nothing here yet."}
        </Typography>
      </Box>
    );
  return (
    <>
      {children}
      {query.hasNextPage && (
        <Stack alignItems="center" sx={{ my: 3 }}>
          <Button
            variant="outlined"
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </Stack>
      )}
    </>
  );
}
