import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Bell,
  BookOpen,
  Compass,
  Library,
  Users,
  MessagesSquare,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  UserRound,
  Shield,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useColorMode } from "@/theme/ColorMode";
import { useAccount } from "@/components/SessionGate";
import { useResource } from "@/hooks/api";
import { signOut } from "@/api/client";
import ActionError from "@/components/ActionError";
export default function App() {
  const { dark, toggle } = useColorMode();
  const account = useAccount();
  const profile = useResource("/me");
  const unread = useResource("/notifications/unread-count", true, {
    refetchInterval: 30000,
  });
  const logout = useMutation({ mutationFn: signOut, retry: false });
  const nav = [
    ["Discover", "/", Compass],
    ["For you", "/recommendations", Sparkles],
    ["My library", "/library", Library],
    ["Community", "/community", MessagesSquare],
    ["Book clubs", "/clubs", Users],
    ["Readers", "/readers", UserRound],
    ["My profile", "/profile", UserRound],
    ...(account.role === "ADMIN" ? [["Administration", "/admin", Shield]] : []),
  ];
  const links = nav.map(([label, path, Icon]) => (
    <Button
      key={path}
      component={NavLink}
      to={path}
      end={path === "/"}
      startIcon={<Icon size={18} />}
      sx={{
        whiteSpace: "nowrap",
        justifyContent: "flex-start",
        color: "text.secondary",
        "&.active": { bgcolor: "action.selected", color: "primary.main" },
      }}
    >
      {label}
    </Button>
  ));
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="aside"
        sx={{
          width: 232,
          p: 3,
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ color: "primary.main", my: 2, mb: 5 }}
        >
          <BookOpen size={28} />
          <Typography variant="h5">bookmuse.</Typography>
        </Stack>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontSize: 10, letterSpacing: 2, mb: 1 }}
        >
          YOUR READING SPACE
        </Typography>
        <Stack gap={0.8}>{links}</Stack>
        <Box sx={{ mt: "auto", pt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Stack direction="row" alignItems="center" gap={1}>
            <Avatar src={profile.data?.avatarUrl || undefined}>
              {account.name?.slice(0, 1)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap fontWeight={600} variant="body2">
                {profile.data?.name || account.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {account.role === "ADMIN" ? "Administrator" : "Reader"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Box
        sx={{
          ml: { md: "232px" },
          width: { xs: "100%", md: "calc(100% - 232px)" },
        }}
      >
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={1}
          sx={{
            minHeight: 78,
            px: { xs: 2, lg: 4 },
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography color="text.secondary" variant="body2">
            A home for your reading life
          </Typography>
          <Stack direction="row" alignItems="center">
            <IconButton
              component={NavLink}
              to="/notifications"
              aria-label={
                unread.data
                  ? `${unread.data.count} unread notifications`
                  : "Notifications"
              }
            >
              <Badge badgeContent={unread.data?.count} color="primary">
                <Bell size={20} />
              </Badge>
            </IconButton>
            <IconButton aria-label="Toggle color theme" onClick={toggle}>
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            <IconButton
              aria-label="Sign out"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
            >
              <LogOut size={20} />
            </IconButton>
          </Stack>
        </Stack>
        <Box sx={{ px: 2 }}>
          <ActionError action={logout} />
        </Box>
        {unread.isError && (
          <Typography
            component={NavLink}
            to="/notifications"
            sx={{
              display: "block",
              px: 3,
              pt: 1,
              color: "error.main",
              fontSize: 12,
            }}
          >
            Notification count unavailable - view notifications
          </Typography>
        )}
        <Stack
          direction="row"
          sx={{
            display: { xs: "flex", md: "none" },
            overflowX: "auto",
            p: 1,
            gap: 0.5,
          }}
        >
          {links}
        </Stack>
        <Box
          component="main"
          sx={{ p: { xs: 2, lg: 4 }, maxWidth: 1500, mx: "auto" }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
