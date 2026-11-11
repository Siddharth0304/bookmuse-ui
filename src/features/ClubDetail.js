import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  items,
  useAction,
  useAll,
  useCollection,
  useResource,
} from "@/hooks/api";
import { useAccount } from "@/components/SessionGate";
import QueryState from "@/components/QueryState";
import ActionError from "@/components/ActionError";
import Editor from "@/components/Editor";
import Confirm from "@/components/Confirm";
import DiscussionThread from "@/features/DiscussionThread";
import { clubFields, discussionFields } from "@/features/fields";
export default function ClubDetail({ id }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const account = useAccount();
  const club = useResource("/clubs/" + id);
  const members = useAll(`/clubs/${id}/members`, !!club.data);
  const member = members.data?.some((item) => item.id === account.id) || false;
  const creator = club.data?.creatorId === account.id;
  const discussions = useCollection(`/clubs/${id}/discussions`, {}, member);
  const target = params.get("discussion");
  const targetList = useAll(`/clubs/${id}/discussions`, member && !!target);
  const selected = targetList.data?.find((item) => item.id === target);
  const action = useAction();
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState(false);
  const [create, setCreate] = useState(false);
  return (
    <QueryState query={club}>
      {club.data && (
        <Stack gap={3}>
          <Box>
            <Chip label="BOOK CLUB" size="small" sx={{ mb: 2 }} />
            <Typography variant="h3">{club.data.name}</Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 2, whiteSpace: "pre-wrap" }}
            >
              {club.data.description || "No description provided."}
            </Typography>
          </Box>
          <QueryState query={members}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {members.data && (
                <Chip label={`${members.data.length} members`} />
              )}
              <Button
                variant="contained"
                disabled={action.isPending || !members.isSuccess}
                onClick={() =>
                  action.mutate({
                    path: `/clubs/${id}/membership`,
                    method: member ? "DELETE" : "PUT",
                  })
                }
                sx={{ display: creator ? "none" : undefined }}
              >
                {member ? "Leave club" : "Join club"}
              </Button>
              {creator && (
                <>
                  <Chip label="Club creator" />
                  <Button onClick={() => setEdit(true)}>Edit club</Button>
                  <Button color="error" onClick={() => setRemove(true)}>
                    Delete club
                  </Button>
                </>
              )}
            </Stack>
            <ActionError action={action} />
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
              {members.data?.map((item) => (
                <Chip
                  key={item.id}
                  component={Link}
                  to={"/users/" + item.id}
                  clickable
                  avatar={
                    <Avatar src={item.avatarUrl || undefined}>
                      {item.name?.slice(0, 1)}
                    </Avatar>
                  }
                  label={item.name}
                />
              ))}
            </Stack>
          </QueryState>
          <Divider />
          {member ? (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5">Discussions</Typography>
                <Button variant="contained" onClick={() => setCreate(true)}>
                  Start discussion
                </Button>
              </Stack>
              {target ? (
                <QueryState query={targetList}>
                  {selected ? (
                    <>
                      <Button
                        onClick={() => setParams({})}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        All discussions
                      </Button>
                      <DiscussionThread
                        key={selected.id}
                        discussion={selected}
                      />
                    </>
                  ) : (
                    targetList.isSuccess && (
                      <Alert severity="warning">
                        This discussion no longer exists in this club.{" "}
                        <Button onClick={() => setParams({})}>
                          Back to discussions
                        </Button>
                      </Alert>
                    )
                  )}
                </QueryState>
              ) : (
                <QueryState
                  query={discussions}
                  count={items(discussions).length}
                  empty="No discussions yet. Start the first one."
                >
                  {items(discussions).map((item) => (
                    <Card
                      key={item.id}
                      sx={{ p: 3, border: 1, borderColor: "divider" }}
                    >
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ mt: 1, whiteSpace: "pre-wrap" }}
                      >
                        {item.body}
                      </Typography>
                      <Button
                        onClick={() => setParams({ discussion: item.id })}
                      >
                        Open discussion
                      </Button>
                    </Card>
                  ))}
                </QueryState>
              )}
            </>
          ) : (
            members.isSuccess && (
              <Alert severity="info">
                Join this club to read discussions and share your thoughts.
              </Alert>
            )
          )}
        </Stack>
      )}
      {edit && (
        <Editor
          title="Edit club"
          fields={clubFields}
          initial={club.data}
          path={"/clubs/" + id}
          method="PUT"
          onClose={() => setEdit(false)}
        />
      )}{" "}
      {create && (
        <Editor
          title="Start a discussion"
          fields={discussionFields}
          path={`/clubs/${id}/discussions`}
          onClose={() => setCreate(false)}
          onSaved={(data) => setParams({ discussion: data.id })}
        />
      )}{" "}
      {remove && (
        <Confirm
          title="Delete this club?"
          description="This permanently removes the club, all memberships, discussions, and replies."
          path={"/clubs/" + id}
          onClose={() => setRemove(false)}
          onDone={() => navigate("/clubs")}
        />
      )}
    </QueryState>
  );
}
