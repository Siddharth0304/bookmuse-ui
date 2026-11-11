import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import ActionError from "@/components/ActionError";
import { useAction } from "@/hooks/api";
const labels = (value) => [
  ...new Set(
    value
      .split(",")
      .map((label) => label.trim().toLowerCase())
      .filter(Boolean),
  ),
];
export default function Editor({
  title,
  fields,
  initial = {},
  path,
  method = "POST",
  onClose,
  onSaved,
}) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        Array.isArray(initial[field.name])
          ? initial[field.name].join(", ")
          : (initial[field.name] ?? field.default ?? ""),
      ]),
    ),
  );
  const [validation, setValidation] = useState("");
  const action = useAction((data) => {
    onSaved?.(data);
    onClose();
  });
  function submit(event) {
    event.preventDefault();
    setValidation("");
    const body = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.required && !String(value).trim()) {
        setValidation(`${field.label} is required.`);
        return;
      }
      if (field.labels) {
        const list = labels(value);
        if (
          list.length > 10 ||
          (field.required && !list.length) ||
          list.some(
            (label) => label.length > 50 || !/^[\p{L}\p{N} -]+$/u.test(label),
          )
        ) {
          setValidation(
            "Use up to 10 unique genres, each at most 50 letters, numbers, spaces or hyphens.",
          );
          return;
        }
        body[field.name] = list;
      } else
        body[field.name] =
          field.type === "number"
            ? value === ""
              ? null
              : Number(value)
            : value === "" && !field.required
              ? null
              : String(value).trim();
    }
    action.mutate({ path, method, body });
  }
  return (
    <Dialog
      open
      onClose={action.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <Stack component="form" onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack gap={2} sx={{ pt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                value={values[field.name]}
                required={field.required}
                type={field.type || "text"}
                multiline={field.multiline}
                minRows={field.multiline ? 3 : undefined}
                select={!!field.options}
                helperText={
                  field.labels ? "Comma-separated genres" : field.helper
                }
                onChange={(event) =>
                  setValues({ ...values, [field.name]: event.target.value })
                }
                slotProps={{
                  htmlInput: {
                    maxLength: field.max,
                    min: field.min,
                    max: field.maxValue,
                    step: field.type === "number" ? 1 : undefined,
                  },
                }}
              >
                {field.options?.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
            {validation && (
              <TextField
                error
                value={validation}
                slotProps={{ input: { readOnly: true } }}
                label="Please check your input"
              />
            )}
            <ActionError action={action} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button disabled={action.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={action.isPending}>
            {action.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}
