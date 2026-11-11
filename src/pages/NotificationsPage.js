import { Button, Card, Chip, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { items, useAction, useCollection } from "@/hooks/api";
import { write } from "@/api/client";
import { notificationTarget } from "@/api/notifications";
import QueryState from "@/components/QueryState";
import ActionError from "@/components/ActionError";
import ReaderLink from "@/components/ReaderLink";
const descriptions = {
  NEW_FOLLOWER: "started following you",
  LIKE: "liked your post",
  SHARE: "shared your post",
  COMMENT: "commented on your post",
  CLUB_JOIN: "joined your club",
  DISCUSSION_REPLY: "replied to your discussion",
};
export default function NotificationsPage() {
  const query = useCollection("/notifications");
  const data = items(query);
  const action = useAction();
  const navigate = useNavigate();
  const client = useQueryClient();
  const open = useMutation({
    mutationFn: async (notification) => {
      const target = await notificationTarget(notification, client);
      if (!notification.read)
        await write(`/notifications/${notification.id}/read`, "PUT");
      return target;
    },
    onSuccess: (target) => {
      client.invalidateQueries({ queryKey: ["api"] });
      navigate(target);
    },
    retry: false,
  });
  return (
    <Stack gap={3}>
      <Stack
        direction="row"
        gap={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4">Your reading world, in the loop.</Typography>
        <Button
          disabled={action.isPending}
          onClick={() => action.mutate({ path: "/notifications/read-all" })}
        >
          Mark all read
        </Button>
      </Stack>
      <Button onClick={() => query.refetch()} sx={{ alignSelf: "flex-start" }}>
        Refresh notifications
      </Button>
      <ActionError action={action} />
      <ActionError action={open} />
      <QueryState
        query={query}
        count={data.length}
        empty="You are all caught up. New activity will appear here."
      >
        {data.map((item) => (
          <Card
            key={item.id}
            sx={{
              p: 3,
              border: 1,
              borderColor: "divider",
              bgcolor: item.read ? "background.paper" : "action.hover",
            }}
          >
            <Stack gap={1}>
              <Stack direction="row" gap={1} alignItems="center">
                <ReaderLink id={item.actorId} />
                {!item.read && (
                  <Chip label="Unread" size="small" color="primary" />
                )}
              </Stack>
              <Typography>{descriptions[item.type] || item.type}</Typography>
              <Typography color="text.secondary" variant="caption">
                {new Date(item.createdAt).toLocaleString()}
              </Typography>
              <Stack direction="row">
                <Button
                  disabled={open.isPending}
                  onClick={() => open.mutate(item)}
                >
                  View activity
                </Button>
                {!item.read && (
                  <Button
                    disabled={action.isPending}
                    onClick={() =>
                      action.mutate({ path: `/notifications/${item.id}/read` })
                    }
                  >
                    Mark read
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>
        ))}
      </QueryState>
    </Stack>
  );
}
