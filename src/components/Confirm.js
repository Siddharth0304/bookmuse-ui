import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useAction } from "@/hooks/api";
import ActionError from "@/components/ActionError";
export default function Confirm({
  title,
  description,
  path,
  method = "DELETE",
  body,
  onClose,
  onDone,
}) {
  const action = useAction(() => {
    onDone?.();
    onClose();
  });
  return (
    <Dialog open onClose={action.isPending ? undefined : onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        <ActionError action={action} />
      </DialogContent>
      <DialogActions>
        <Button disabled={action.isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="error"
          disabled={action.isPending}
          onClick={() => action.mutate({ path, method, body })}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
