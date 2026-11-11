import { allPages } from "@/api/client";
// Reply notifications omit clubId. Discover the discussion only in clubs accessible to this reader.
export async function notificationTarget(notification, client) {
  const id = notification.resourceId;
  if (notification.type === "NEW_FOLLOWER") return "/users/" + id;
  if (["LIKE", "SHARE", "COMMENT"].includes(notification.type))
    return "/posts/" + id;
  if (notification.type === "CLUB_JOIN") return "/clubs/" + id;
  if (notification.type === "DISCUSSION_REPLY") {
    const clubs = await client.fetchQuery({
      queryKey: ["api", "/clubs", "all"],
      queryFn: () => allPages("/clubs"),
    });
    for (const club of clubs) {
      try {
        const path = `/clubs/${club.id}/discussions`;
        const discussions = await client.fetchQuery({
          queryKey: ["api", path, "all"],
          queryFn: () => allPages(path),
        });
        if (discussions.some((item) => item.id === id))
          return `/clubs/${club.id}?discussion=${encodeURIComponent(id)}`;
      } catch (error) {
        if (![403, 404].includes(error.status)) throw error;
      }
    }
    throw new Error(
      "This discussion was deleted or belongs to a club you can no longer access.",
    );
  }
  throw new Error("This notification type is not supported.");
}
