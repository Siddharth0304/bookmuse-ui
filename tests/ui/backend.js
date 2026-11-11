// Test-only API responses. Production source contains no fixtures or fallback data.
export const meId = "00000000-0000-4000-8000-000000000001";
export const otherId = "00000000-0000-4000-8000-000000000002";
export const bookId = "00000000-0000-4000-8000-000000000003";
export const postId = "00000000-0000-4000-8000-000000000004";
export const clubId = "00000000-0000-4000-8000-000000000005";
export const discussionId = "00000000-0000-4000-8000-000000000006";
export async function backend(
  page,
  { admin = false, member = false, creator = false } = {},
) {
  const calls = [];
  const profile = {
    id: meId,
    name: "Contract Reader",
    bio: null,
    avatarUrl: null,
    favouriteGenres: [],
    followers: 0,
    following: 0,
    booksRead: 0,
  };
  const other = { ...profile, id: otherId, name: "Other Reader" };
  const state = {
    profile,
    other,
    books: [
      {
        id: bookId,
        title: "Contract Book",
        author: "Contract Author",
        genres: ["fiction"],
        summary: "A summary from the API.",
        coverUrl: null,
      },
    ],
    library: [],
    posts: [
      {
        id: postId,
        userId: meId,
        bookId,
        body: "A thought from the API.",
        createdAt: "2026-01-01T00:00:00Z",
        likes: 0,
        shares: 0,
        comments: 0,
      },
    ],
    comments: [],
    clubs: [
      {
        id: clubId,
        creatorId: creator ? meId : otherId,
        name: "Contract Club",
        description: "A club from the API.",
      },
    ],
    members: member
      ? [{ id: meId, name: profile.name, avatarUrl: null }]
      : [{ id: otherId, name: other.name, avatarUrl: null }],
    discussions: [
      {
        id: discussionId,
        userId: otherId,
        clubId,
        title: "Contract Discussion",
        body: "A discussion from the API.",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    replies: [],
    following: [],
    notifications: [],
    accounts: [
      {
        id: otherId,
        name: other.name,
        email: "other@example.com",
        role: "USER",
        blocked: false,
      },
    ],
  };
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api", "");
    const method = request.method();
    const body = request.postDataJSON();
    calls.push({ path, method, body, search: url.search });
    const send = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: status === 204 ? "" : JSON.stringify(data),
      });
    const list = (data) => {
      const number = Number(url.searchParams.get("page") || 0);
      const size = Number(url.searchParams.get("size") || 20);
      return send({
        content: data.slice(number * size, (number + 1) * size),
        number,
        size,
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
      });
    };
    const noContent = () => send(null, 204);
    if (
      path === "/auth/login" ||
      path === "/auth/register" ||
      path === "/auth/refresh"
    )
      return send({
        accessToken: "test-access",
        refreshToken: "test-refresh",
        expiresIn: 900,
        tokenType: "Bearer",
      });
    if (path === "/auth/logout") return noContent();
    if (request.headers().authorization !== "Bearer test-access")
      return send({ title: "Unauthorized" }, 401);
    if (path === "/me/account")
      return send({
        id: meId,
        name: profile.name,
        email: "reader@example.com",
        role: admin ? "ADMIN" : "USER",
        blocked: false,
      });
    if (path === "/me") {
      if (method === "PUT") Object.assign(profile, body);
      return send(profile);
    }
    if (path === "/books") {
      if (method === "POST") {
        const book = { id: crypto.randomUUID(), ...body };
        state.books.push(book);
        return send(book, 201);
      }
      const search = url.searchParams.get("search")?.toLowerCase() || "";
      const genre = url.searchParams.get("genre");
      return list(
        state.books.filter(
          (book) =>
            (book.title + " " + book.author).toLowerCase().includes(search) &&
            (!genre || book.genres.includes(genre)),
        ),
      );
    }
    if (path.startsWith("/books/")) {
      const id = path.split("/")[2];
      const book = state.books.find((b) => b.id === id);
      if (!book) return send({ title: "Not Found" }, 404);
      if (method === "DELETE") {
        state.books = state.books.filter((b) => b.id !== id);
        return noContent();
      }
      if (method === "PUT") Object.assign(book, body);
      return send(book);
    }
    if (path === "/me/recommendations")
      return list(
        state.books.filter(
          (book) => !state.library.some((entry) => entry.bookId === book.id),
        ),
      );
    if (
      path === "/me/library" ||
      (path.endsWith("/library") && path.startsWith("/users/"))
    )
      return list(state.library);
    if (path.startsWith("/me/library/")) {
      const id = path.split("/")[3];
      state.library = state.library.filter((entry) => entry.bookId !== id);
      if (method === "DELETE") return noContent();
      const entry = { id: crypto.randomUUID(), bookId: id, ...body };
      if (entry.status === "READ") entry.progress = 100;
      state.library.push(entry);
      return send(entry);
    }
    if (path === "/users") return list([profile, other]);
    if (path === `/users/${meId}/following`) {
      if (method === "GET") return list(state.following);
    }
    if (path.endsWith("/following") || path.endsWith("/followers"))
      return list([]);
    if (path.endsWith("/follow")) {
      state.following = method === "DELETE" ? [] : [other];
      other.followers = method === "DELETE" ? 0 : 1;
      return noContent();
    }
    if (path.startsWith("/users/"))
      return send(path.split("/")[2] === meId ? profile : other);
    if (path === "/posts") {
      if (method === "POST") {
        const post = {
          id: crypto.randomUUID(),
          userId: meId,
          ...body,
          likes: 0,
          shares: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
        };
        state.posts.unshift(post);
        return send(post, 201);
      }
      return list(
        state.posts.filter(
          (post) =>
            !url.searchParams.get("bookId") ||
            post.bookId === url.searchParams.get("bookId"),
        ),
      );
    }
    if (path.startsWith("/posts/")) {
      const id = path.split("/")[2];
      const post = state.posts.find((p) => p.id === id);
      if (!post) return send({ title: "Not Found" }, 404);
      if (path.endsWith("/like")) {
        post.likes = method === "PUT" ? 1 : 0;
        return noContent();
      }
      if (path.endsWith("/shares")) {
        post.shares++;
        return send({ id: crypto.randomUUID() }, 201);
      }
      if (path.endsWith("/comments")) {
        if (method === "POST") {
          const comment = {
            id: crypto.randomUUID(),
            userId: meId,
            postId: id,
            ...body,
            createdAt: new Date().toISOString(),
          };
          state.comments.push(comment);
          post.comments++;
          return send(comment, 201);
        }
        return list(state.comments.filter((c) => c.postId === id));
      }
      if (method === "DELETE") {
        state.posts = state.posts.filter((p) => p.id !== id);
        return noContent();
      }
      if (method === "PUT") Object.assign(post, body);
      return send(post);
    }
    if (path.startsWith("/comments/")) {
      const id = path.split("/")[2];
      const comment = state.comments.find((c) => c.id === id);
      if (method === "DELETE") {
        state.comments = state.comments.filter((c) => c.id !== id);
        return noContent();
      }
      Object.assign(comment, body);
      return send(comment);
    }
    if (path === "/clubs") {
      if (method === "POST") {
        const club = { id: crypto.randomUUID(), creatorId: meId, ...body };
        state.clubs.unshift(club);
        return send(club, 201);
      }
      return list(state.clubs);
    }
    if (path.startsWith("/clubs/")) {
      const id = path.split("/")[2];
      const club = state.clubs.find((c) => c.id === id);
      if (!club) return send({ title: "Not Found" }, 404);
      if (path.endsWith("/members")) return list(state.members);
      if (path.endsWith("/membership")) {
        state.members =
          method === "DELETE"
            ? state.members.filter((m) => m.id !== meId)
            : [
                ...state.members,
                { id: meId, name: profile.name, avatarUrl: null },
              ];
        return noContent();
      }
      if (path.endsWith("/discussions")) {
        if (!state.members.some((m) => m.id === meId))
          return send({ title: "Forbidden" }, 403);
        if (method === "POST") {
          const discussion = {
            id: crypto.randomUUID(),
            userId: meId,
            clubId: id,
            ...body,
            createdAt: new Date().toISOString(),
          };
          state.discussions.push(discussion);
          return send(discussion, 201);
        }
        return list(state.discussions.filter((d) => d.clubId === id));
      }
      if (method === "DELETE") {
        state.clubs = state.clubs.filter((c) => c.id !== id);
        return noContent();
      }
      if (method === "PUT") Object.assign(club, body);
      return send(club);
    }
    if (path.startsWith("/discussions/")) {
      const id = path.split("/")[2];
      if (method === "POST") {
        const reply = {
          id: crypto.randomUUID(),
          userId: meId,
          discussionId: id,
          ...body,
          createdAt: new Date().toISOString(),
        };
        state.replies.push(reply);
        return send(reply, 201);
      }
      return list(state.replies.filter((r) => r.discussionId === id));
    }
    if (path === "/notifications/unread-count")
      return send({ count: state.notifications.filter((n) => !n.read).length });
    if (path === "/notifications/read-all") {
      state.notifications.forEach((n) => (n.read = true));
      return noContent();
    }
    if (path.endsWith("/read")) {
      const n = state.notifications.find((n) => n.id === path.split("/")[2]);
      if (n) n.read = true;
      return noContent();
    }
    if (path === "/notifications") return list(state.notifications);
    if (path === "/admin/users") return list(state.accounts);
    if (path.startsWith("/admin/users/")) {
      const user = state.accounts.find((u) => u.id === path.split("/")[3]);
      Object.assign(user, body);
      return send(user);
    }
    return send({ detail: `Unhandled test endpoint ${method} ${path}` }, 404);
  });
  return { calls, state };
}
export async function signIn(page) {
  await page.goto("/");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("reader@example.com");
  await page.getByLabel("Password", { exact: false }).fill("abcdefgh");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: /Good to see you/ }).waitFor();
}
