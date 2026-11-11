import { test, expect } from "@playwright/test";
import {
  backend,
  signIn,
  bookId,
  postId,
  clubId,
  otherId,
  discussionId,
} from "./backend.js";

test("auth gate, server-only catalogue, status writes, removal, logout and no stored business data", async ({
  page,
}) => {
  const { calls } = await backend(page);
  await page.goto("/");
  await expect(page).toHaveURL(/login/);
  expect(calls).toHaveLength(0);
  await signIn(page);
  await page
    .getByRole("link", { name: /Contract Book/ })
    .first()
    .click();
  await expect(page.getByText("A summary from the API.")).toBeVisible();
  await page.getByRole("button", { name: "Add to my library" }).click();
  await page.getByRole("combobox", { name: "Reading status" }).click();
  await page.getByRole("option", { name: "Currently reading" }).click();
  await page.getByRole("spinbutton", { name: "Progress (%)" }).fill("43");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    calls.some(
      (c) =>
        c.method === "PUT" &&
        c.path === `/me/library/${bookId}` &&
        c.body.progress === 43,
    ),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "My library", exact: true })
    .first()
    .click();
  await expect(page.getByText("Reading - 43%")).toBeVisible();
  await page
    .getByRole("link", { name: /Contract Book/ })
    .first()
    .click();
  await page.getByRole("button", { name: "Remove from library" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/login/);
  expect(calls.some((c) => c.path === "/auth/logout")).toBeTruthy();
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
});

test("catalogue server filters, pagination and recommendation endpoint", async ({
  page,
}) => {
  const { calls, state } = await backend(page);
  state.books.push(
    ...Array.from({ length: 20 }, (_, i) => ({
      ...state.books[0],
      id: crypto.randomUUID(),
      title: `Book ${i}`,
      genres: i === 19 ? ["fantasy"] : ["fiction"],
    })),
  );
  await signIn(page);
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByRole("link", { name: /Book 19/ })).toBeVisible();
  expect(
    calls.some((c) => c.path === "/books" && c.search.includes("page=1")),
  ).toBeTruthy();
  await page
    .getByRole("textbox", { name: "Search title or author" })
    .fill("Contract");
  await page.getByRole("combobox", { name: "Genres", exact: true }).click();
  await expect(
    page.getByRole("option", { name: "fiction", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("option", { name: "fantasy", exact: true }),
  ).toBeVisible();
  await page.getByRole("option", { name: "fiction", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Genres", exact: true })
    .press("Escape");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("link", { name: /Book 19/ })).toHaveCount(0);
  expect(
    calls.some(
      (c) =>
        c.path === "/books" &&
        c.search.includes("page=0") &&
        c.search.includes("search=Contract") &&
        c.search.includes("genre=fiction"),
    ),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "For you", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "A little more your kind of story." }),
  ).toBeVisible();
  expect(calls.some((c) => c.path === "/me/recommendations")).toBeTruthy();
});

test("posts, engagement and comment CRUD use backend writes", async ({
  page,
}) => {
  const { calls } = await backend(page);
  await signIn(page);
  await page
    .getByRole("link", { name: "Community", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Write a post" }).click();
  await page.getByRole("combobox", { name: "Book", exact: true }).click();
  await page.getByRole("option", { name: /Contract Book/ }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("A new API post.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("A new API post.", { exact: true }),
  ).toBeVisible();
  const original = page
    .getByText("A thought from the API.", { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"MuiCard-root")]');
  await original.getByRole("button", { name: /^Like/ }).click();
  await expect(
    original.getByRole("button", { name: "Like - 1" }),
  ).toBeVisible();
  await original.getByRole("button", { name: "Remove like" }).click();
  await expect(
    original.getByRole("button", { name: "Like - 0" }),
  ).toBeVisible();
  await original.getByRole("button", { name: /^Share/ }).click();
  await expect(
    original.getByRole("button", { name: "Share - 1" }),
  ).toBeVisible();
  await original.getByRole("link", { name: "Open conversation" }).click();
  await page.getByRole("button", { name: "Add a comment" }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("A backend comment.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByText("A backend comment.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("Updated comment.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.locator("#root p").filter({ hasText: /^Updated comment\.$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText("Updated comment.", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Edit post" }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("Updated API post.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.locator("#root p").filter({ hasText: /^Updated API post\.$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete post" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL(/community/);
  expect(
    calls.some((c) => c.path === `/posts/${postId}` && c.method === "DELETE"),
  ).toBeTruthy();
});

test("club join, discussion creation, replies and leaving respect membership", async ({
  page,
}) => {
  const { calls } = await backend(page);
  await signIn(page);
  await page
    .getByRole("link", { name: "Book clubs", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Visit club" }).click();
  await expect(
    page.getByText(
      "Join this club to read discussions and share your thoughts.",
    ),
  ).toBeVisible();
  expect(
    calls.some((c) => c.path === `/clubs/${clubId}/discussions`),
  ).toBeFalsy();
  await page.getByRole("button", { name: "Join club", exact: true }).click();
  await expect(
    page.getByText("Contract Discussion", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start discussion" }).click();
  await page
    .getByRole("textbox", { name: "Discussion title" })
    .fill("New discussion");
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("A new discussion body.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "New discussion", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Write a reply" }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("A reply from a reader.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("A reply from a reader.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Leave club" }).click();
  await expect(
    page.getByText(
      "Join this club to read discussions and share your thoughts.",
    ),
  ).toBeVisible();
  expect(
    calls.some(
      (c) => c.path === `/clubs/${clubId}/membership` && c.method === "DELETE",
    ),
  ).toBeTruthy();
});

test("reader profiles, follow/unfollow, own profile and relationship lists", async ({
  page,
}) => {
  const { calls } = await backend(page);
  await signIn(page);
  await page
    .getByRole("link", { name: "Readers", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: /Other Reader/ }).click();
  await page.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Unfollow", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Unfollow", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Follow", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Followers", exact: true }).click();
  await expect(page.getByText("No readers here yet.")).toBeVisible();
  await page.getByRole("tab", { name: "Following", exact: true }).click();
  expect(
    calls.some((c) => c.path === `/users/${otherId}/followers`),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "My profile", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Updated Reader");
  await page
    .getByRole("textbox", { name: "Bio", exact: true })
    .fill("My backend bio.");
  await page
    .getByRole("textbox", { name: "Favourite genres" })
    .fill("fiction, fantasy");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Updated Reader" }),
  ).toBeVisible();
  expect(
    calls.some(
      (c) =>
        c.path === "/me" &&
        c.method === "PUT" &&
        c.body.favouriteGenres.length === 2,
    ),
  ).toBeTruthy();
});

test("admin book creation/edit/delete and account block/reactivate", async ({
  page,
}) => {
  const { calls } = await backend(page, { admin: true });
  await signIn(page);
  await page
    .getByRole("link", { name: "Administration", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Add book" }).click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Added Book");
  await page
    .getByRole("textbox", { name: "Author", exact: true })
    .fill("API Author");
  await page
    .getByRole("textbox", { name: "Genres", exact: true })
    .fill("fiction");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const card = page
    .getByRole("link", { name: "Added Book", exact: true })
    .locator('xpath=ancestor::div[contains(@class,"MuiCard-root")]');
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Summary", exact: true })
    .fill("Updated summary");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await card.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Added Book", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("tab", { name: "Accounts" }).click();
  await page.getByRole("button", { name: "Block", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Reactivate", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reactivate", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Block", exact: true }),
  ).toBeVisible();
  expect(
    calls.some(
      (c) =>
        c.path === `/admin/users/${otherId}/status` && c.body.blocked === true,
    ),
  ).toBeTruthy();
});

test("notifications resolve discussion context using backend clubs and mark read", async ({
  page,
}) => {
  const { calls, state } = await backend(page, { member: true });
  state.notifications = [
    {
      id: "notification",
      actorId: otherId,
      type: "DISCUSSION_REPLY",
      resourceId: discussionId,
      read: false,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ];
  await signIn(page);
  await page.getByRole("link", { name: /unread notifications/ }).click();
  await page.getByRole("button", { name: "View activity" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/clubs/${clubId}.*discussion=${discussionId}`),
  );
  await expect(
    page.getByRole("heading", { name: "Contract Discussion" }),
  ).toBeVisible();
  expect(
    calls.some(
      (c) =>
        c.path === "/notifications/notification/read" && c.method === "PUT",
    ),
  ).toBeTruthy();
  await page.getByRole("link", { name: /unread notifications/ }).click();
  await page.getByRole("button", { name: "Mark all read" }).click();
  await expect(page.getByText("Unread", { exact: true })).toHaveCount(0);
  expect(calls.some((c) => c.path === "/notifications/read-all")).toBeTruthy();
});

test("mobile and dark mode render with no horizontal overflow or browser errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await backend(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await signIn(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await expect(
    page.getByRole("button", { name: "Toggle color theme" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page
    .getByRole("link", { name: /Contract Book/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Contract Book", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});

test("club creator can update/delete a club and create a new club", async ({
  page,
}) => {
  const { calls } = await backend(page, { member: true, creator: true });
  await signIn(page);
  await page
    .getByRole("link", { name: "Book clubs", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Visit club" }).click();
  await expect(page.getByRole("button", { name: "Leave club" })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit club" }).click();
  await page.getByRole("textbox", { name: "Club name" }).fill("Updated Club");
  await page
    .getByRole("textbox", { name: "Description", exact: true })
    .fill("Updated club description.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Updated Club" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete club" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL(/\/clubs$/);
  await page.getByRole("button", { name: "Create club" }).click();
  await page.getByRole("textbox", { name: "Club name" }).fill("New API Club");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "New API Club", exact: true }),
  ).toBeVisible();
  expect(
    calls.some((c) => c.method === "PUT" && c.path === `/clubs/${clubId}`),
  ).toBeTruthy();
  expect(
    calls.some((c) => c.method === "POST" && c.path === "/clubs"),
  ).toBeTruthy();
});

test("missing resources, permission denial and server validation display backend errors", async ({
  page,
}) => {
  await backend(page);
  await signIn(page);
  await page.route("**/api/books/missing", (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/problem+json",
      body: JSON.stringify({ title: "Not Found" }),
    }),
  );
  // SPA navigation preserves the in-memory authentication session.
  await page.evaluate(() => {
    history.pushState({}, "", "/books/missing");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByRole("alert")).toContainText(
    "This resource no longer exists.",
  );
  await page
    .getByRole("link", { name: "Community", exact: true })
    .first()
    .click();
  await page.route(`**/api/posts/${postId}/like`, (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/problem+json",
      body: JSON.stringify({ detail: "Permission was denied by the backend." }),
    }),
  );
  await page.getByRole("button", { name: /^Like/ }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Permission was denied by the backend.",
  );
  await page.route(`**/api/posts/${postId}`, (route) =>
    route.fulfill({
      status: 400,
      contentType: "application/problem+json",
      body: JSON.stringify({ errors: ["body: rejected by server validation"] }),
    }),
  );
  await page.getByRole("button", { name: "Edit post" }).click();
  await page
    .getByRole("textbox", { name: "Your thoughts" })
    .fill("Changed post");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "body: rejected by server validation",
  );
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("membership and following controls resolve relationships beyond page one", async ({
  page,
}) => {
  const { state, calls } = await backend(page);
  state.following = Array.from({ length: 20 }, (_, i) => ({
    ...state.other,
    id: crypto.randomUUID(),
    name: `Reader ${i}`,
  }));
  state.following.push(state.other);
  state.members = Array.from({ length: 20 }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Member ${i}`,
    avatarUrl: null,
  }));
  state.members.push({
    id: state.profile.id,
    name: state.profile.name,
    avatarUrl: null,
  });
  await signIn(page);
  await page
    .getByRole("link", { name: "Readers", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: /Other Reader/ }).click();
  await expect(
    page.getByRole("button", { name: "Unfollow", exact: true }),
  ).toBeVisible();
  expect(
    calls.some(
      (c) => c.path.endsWith("/following") && c.search.includes("page=1"),
    ),
  ).toBeTruthy();
  await page
    .getByRole("link", { name: "Book clubs", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Visit club" }).click();
  await expect(page.getByRole("button", { name: "Leave club" })).toBeVisible();
  expect(
    calls.some(
      (c) => c.path.endsWith("/members") && c.search.includes("page=1"),
    ),
  ).toBeTruthy();
});

test("searchable genres allow multiple selections, merge complete backend results and reset", async ({
  page,
}) => {
  const { state, calls } = await backend(page);
  state.books[0].genres = ["fiction", "fantasy"];
  state.books.push(
    ...Array.from({ length: 21 }, (_, i) => ({
      ...state.books[0],
      id: crypto.randomUUID(),
      title: `Fantasy ${i}`,
      genres: ["fantasy"],
    })),
  );
  state.books.push({
    ...state.books[0],
    id: crypto.randomUUID(),
    title: "History Only",
    genres: ["history"],
  });
  await signIn(page);
  const menu = page.getByRole("combobox", { name: "Genres", exact: true });
  await menu.fill("fant");
  await expect(
    page.getByRole("option", { name: "fantasy", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: "fiction", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("option", { name: "fantasy", exact: true }).click();
  await menu.fill("fict");
  await page.getByRole("option", { name: "fiction", exact: true }).click();
  await menu.press("Escape");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("link", { name: /Fantasy 20/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Contract Book/ })).toHaveCount(
    1,
  );
  await expect(page.getByRole("link", { name: /History Only/ })).toHaveCount(0);
  expect(
    calls.some(
      (call) =>
        call.path === "/books" &&
        call.search.includes("genre=fantasy") &&
        call.search.includes("page=1"),
    ),
  ).toBeTruthy();
  expect(
    calls.some(
      (call) => call.path === "/books" && call.search.includes("genre=fiction"),
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByRole("link", { name: /History Only/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "fiction", exact: true }),
  ).toHaveCount(0);
});
