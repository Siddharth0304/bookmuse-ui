# Backend endpoint coverage

Source contract: `../bookmuse/docs/API.md`, `FRONTEND_GUIDE.md`, `SCHEMA.md`, `VERIFICATION.md`, and the backend controllers/DTOs/services. Paths below are relative to `/api`. The UI supplies bearer tokens on protected calls and JSON bodies on writes. A 204 response is treated as empty.

| Endpoints | UI entry point |
| --- | --- |
| POST `/auth/register`, `/auth/login` | Sign-in / create-account screen |
| POST `/auth/refresh` | Serialized session lifecycle in `src/api/client.js` |
| POST `/auth/logout` | Header sign-out action |
| GET `/me/account`, `/me` | Authenticated layout, role controls, own profile |
| GET `/books`, `/books/{id}` | Discover, book detail, cached book references |
| POST `/books`, PUT/DELETE `/books/{id}` | Administration catalogue; edit/delete also on book detail for admins |
| GET `/me/library` | My library and reading-status lookup |
| PUT/DELETE `/me/library/{bookId}` | Book detail reading editor / remove confirmation |
| GET `/users/{id}/library` | Reader profile Bookshelf tab |
| GET `/me/recommendations` | For you |
| PUT `/me` | My profile editor, including all replaceable fields |
| GET `/users`, `/users/{id}` | Readers and reader profiles; cached author/actor references |
| PUT/DELETE `/users/{id}/follow` | Other-reader profile |
| GET `/users/{id}/followers`, `/users/{id}/following` | Reader profile tabs; all pages of own following used to determine follow state |
| GET `/admin/users`, PUT `/admin/users/{id}/status` | Administration Accounts tab; USER accounts only |
| GET `/posts`, `/posts/{id}` | Community, book-specific feed, conversation detail |
| POST `/posts` | Write a post, with backend book selection |
| PUT/DELETE `/posts/{id}` | Owner edit/delete controls |
| PUT/DELETE `/posts/{id}/like` | Explicit Like / Remove like actions |
| POST `/posts/{id}/shares` | Share event action, counts refetched |
| GET/POST `/posts/{id}/comments` | Conversation comments and comment editor |
| PUT/DELETE `/comments/{id}` | Owner comment edit/delete controls |
| GET `/clubs`, `/clubs/{id}` | Book clubs and club detail |
| POST `/clubs` | Create club |
| PUT/DELETE `/clubs/{id}` | Creator edit/delete controls |
| PUT/DELETE `/clubs/{id}/membership` | Join / leave, creator cannot leave |
| GET `/clubs/{id}/members` | Backend membership check and member chips |
| GET/POST `/clubs/{id}/discussions` | Members-only discussion list and editor |
| GET/POST `/discussions/{id}/replies` | Discussion thread and reply editor |
| GET `/notifications`, `/notifications/unread-count` | Notifications and 30-second unread badge polling |
| PUT `/notifications/{id}/read`, `/notifications/read-all` | Mark read, opening activity, mark all read |

All visible lists use the PageView envelope and Load more. Complete relationship sets use an all-pages query. Referenced IDs are resolved using cached detail queries; no embedded objects or batch lookup endpoints are assumed.

Notification target mapping follows the backend contract: NEW_FOLLOWER to user, LIKE/SHARE/COMMENT to post, CLUB_JOIN to club, DISCUSSION_REPLY to discussion discovered through paginated accessible club lists. Missing resources surface an unavailable-resource error.

No local data substitutes for a failed or empty response. Input enums, UI labels and empty-state messages are presentation constants; application records are backend-owned. Test fixtures are isolated from production source.
