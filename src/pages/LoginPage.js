import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { BookOpen } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "@/api/client";
import { useSession } from "@/hooks/api";
import ActionError from "@/components/ActionError";
export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [validation, setValidation] = useState("");
  const session = useSession();
  const location = useLocation();
  const client = useQueryClient();
  const action = useMutation({
    mutationFn: () =>
      signIn(
        {
          email: email.trim(),
          password,
          ...(register ? { name: name.trim() } : {}),
        },
        register,
      ),
    onMutate: async () => {
      await client.cancelQueries();
      client.clear();
    },
    retry: false,
  });
  if (session) return <Navigate to={location.state?.from || "/"} replace />;
  return (
    <Box
      sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 4,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          component="form"
          gap={2.5}
          onSubmit={(event) => {
            event.preventDefault();
            if (register && !name.trim()) {
              setValidation("Please enter your name.");
              return;
            }
            setValidation("");
            action.mutate();
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{ color: "primary.main" }}
          >
            <BookOpen />
            <Typography variant="h5">bookmuse.</Typography>
          </Stack>
          <Box>
            <Typography variant="h4">
              {register ? "Start a new chapter." : "Welcome back."}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Your books. Your people. Your reading life.
            </Typography>
          </Box>
          {register && (
            <TextField
              label="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          )}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 254 } }}
          />
          <TextField
            label="Password"
            type="password"
            required
            autoComplete={register ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{ htmlInput: { minLength: 8, maxLength: 20 } }}
          />
          {validation && <Alert severity="error">{validation}</Alert>}
          <ActionError action={action} />
          <Button type="submit" variant="contained" disabled={action.isPending}>
            {action.isPending
              ? "Connecting..."
              : register
                ? "Create account"
                : "Sign in"}
          </Button>
          <Button
            disabled={action.isPending}
            onClick={() => {
              setRegister(!register);
              action.reset();
            }}
          >
            {register
              ? "Already have an account? Sign in"
              : "New to BookMuse? Create an account"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            All books and activity come from your BookMuse account. Sign in
            again after reloading this tab.
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
