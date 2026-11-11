import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useAccount } from "@/components/SessionGate";
import {
  items,
  useAction,
  useAll,
  useCollection,
  useResource,
} from "@/hooks/api";
import QueryState from "@/components/QueryState";
import ActionError from "@/components/ActionError";
import Editor from "@/components/Editor";
import ReaderCard from "@/components/ReaderCard";
import LibraryBook from "@/components/LibraryBook";
import { profileFields } from "@/features/fields";
export default function ProfileDetail({ id, own }) {
  const account = useAccount();
  const profile = useResource(own ? "/me" : "/users/" + id);
  const [tab, setTab] = useState("library");
  const [edit, setEdit] = useState(false);
  const following = useAll(`/users/${account.id}/following`, !own);
  const follows = following.data?.some((item) => item.id === id);
  const collection = useCollection(`/users/${id}/${tab}`);
  const data = items(collection);
  const action = useAction();
  return (
    <QueryState query={profile}>
      {profile.data && (
        <Stack gap={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            gap={3}
            alignItems="flex-start"
          >
            <Avatar
              src={profile.data.avatarUrl || undefined}
              sx={{ width: 84, height: 84, fontSize: 32 }}
            >
              {profile.data.name?.slice(0, 1)}
            </Avatar>
            <Stack gap={1} sx={{ flex: 1 }}>
              <Typography variant="h4">{profile.data.name}</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {profile.data.bio || "No bio provided."}
              </Typography>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {profile.data.favouriteGenres.map((genre) => (
                  <Chip key={genre} label={genre} size="small" />
                ))}
              </Stack>
              <Typography color="text.secondary" variant="body2">
                {profile.data.booksRead} books read - {profile.data.followers}{" "}
                followers - {profile.data.following} following
              </Typography>
              {own && (
                <Typography variant="body2" color="text.secondary">
                  {account.email} - {account.role}
                </Typography>
              )}
            </Stack>
            {own ? (
              <Button variant="contained" onClick={() => setEdit(true)}>
                Edit profile
              </Button>
            ) : (
              <QueryState query={following}>
                <Button
                  variant="contained"
                  disabled={!following.isSuccess || action.isPending}
                  onClick={() =>
                    action.mutate({
                      path: `/users/${id}/follow`,
                      method: follows ? "DELETE" : "PUT",
                    })
                  }
                >
                  {follows ? "Unfollow" : "Follow"}
                </Button>
              </QueryState>
            )}
          </Stack>
          <ActionError action={action} />
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            variant="scrollable"
          >
            <Tab value="library" label="Bookshelf" />
            <Tab value="followers" label="Followers" />
            <Tab value="following" label="Following" />
          </Tabs>
          <QueryState
            query={collection}
            count={data.length}
            empty={
              tab === "library"
                ? "No books in this bookshelf yet."
                : "No readers here yet."
            }
          >
            {tab === "library" ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2,minmax(0,1fr))",
                    sm: "repeat(3,minmax(0,1fr))",
                    lg: "repeat(4,minmax(0,1fr))",
                  },
                  gap: 3,
                }}
              >
                {data.map((entry) => (
                  <LibraryBook key={entry.id} entry={entry} />
                ))}
              </Box>
            ) : (
              data.map((reader) => (
                <ReaderCard key={reader.id} reader={reader} />
              ))
            )}
          </QueryState>
        </Stack>
      )}
      {edit && (
        <Editor
          title="Edit your profile"
          fields={profileFields}
          initial={profile.data}
          path="/me"
          method="PUT"
          onClose={() => setEdit(false)}
        />
      )}
    </QueryState>
  );
}
