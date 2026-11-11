import { Alert, Button } from "@mui/material";
export default function ActionError({ action }) {
  return action.isError ? (
    <Alert
      severity="error"
      sx={{ my: 2, whiteSpace: "pre-wrap" }}
      action={<Button onClick={() => action.reset()}>Dismiss</Button>}
    >
      {action.error.message}
    </Alert>
  ) : null;
}
