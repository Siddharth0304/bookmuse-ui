import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const fresh = () => import(`../src/api/client.js?test=${crypto.randomUUID()}`);
const json = (body, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const tokens = (access = "access", refresh = "refresh", expiresIn = 900) => ({
  accessToken: access,
  refreshToken: refresh,
  expiresIn,
  tokenType: "Bearer",
});

test("protected requests require authentication and never use fallback data", async () => {
  const client = await fresh();
  globalThis.fetch = () =>
    assert.fail("Unauthenticated requests must not be sent");
  await assert.rejects(client.api("/books"), (error) => error.status === 401);
});

test("login omits bearer headers, protected requests include bearer and JSON headers, 204 is empty", async () => {
  const client = await fresh();
  const calls = [];
  globalThis.fetch = async (path, init) => {
    calls.push({ path, init });
    return path.endsWith("/auth/login") ? json(tokens()) : json(null, 204);
  };
  await client.signIn({ email: "reader@example.com", password: "abcdefgh" });
  assert.equal(calls[0].init.headers.has("Authorization"), false);
  assert.equal(
    await client.write("/me/library/book-id", "PUT", {
      status: "READ",
      progress: 100,
    }),
    undefined,
  );
  assert.equal(calls[1].init.headers.get("Authorization"), "Bearer access");
  assert.equal(calls[1].init.headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    status: "READ",
    progress: 100,
  });
});

test("registration uses public endpoint and not login", async () => {
  const client = await fresh();
  globalThis.fetch = async (path, init) => {
    assert.equal(path, "/api/auth/register");
    assert.equal(init.headers.has("Authorization"), false);
    assert.equal(JSON.parse(init.body).name, "Reader");
    return json(tokens());
  };
  await client.signIn(
    { email: "reader@example.com", password: "abcdefgh", name: "Reader" },
    true,
  );
  assert.ok(client.getSession());
});

test("simultaneous 401s rotate once and retry with the same replacement access token", async () => {
  const client = await fresh();
  let rotations = 0;
  let retries = 0;
  globalThis.fetch = async (path, init) => {
    if (path.endsWith("/login")) return json(tokens("old", "refresh-old"));
    if (path.endsWith("/refresh")) {
      rotations++;
      assert.equal(init.headers.has("Authorization"), false);
      assert.equal(JSON.parse(init.body).refreshToken, "refresh-old");
      await new Promise((resolve) => setTimeout(resolve, 15));
      return json(tokens("new", "refresh-new"));
    }
    if (init.headers.get("Authorization") === "Bearer old")
      return json({ title: "Unauthorized" }, 401);
    assert.equal(init.headers.get("Authorization"), "Bearer new");
    retries++;
    return json({ ok: true });
  };
  await client.signIn({});
  await Promise.all([
    client.api("/books"),
    client.api("/me"),
    client.api("/clubs"),
  ]);
  assert.equal(rotations, 1);
  assert.equal(retries, 3);
  assert.equal(client.getSession().refreshToken, "refresh-new");
});

test("expiry refreshes before sending a protected request, using expiresIn", async () => {
  const client = await fresh();
  const calls = [];
  globalThis.fetch = async (path) => {
    calls.push(path);
    if (path.endsWith("/login")) return json(tokens("expired", "r", 0));
    if (path.endsWith("/refresh")) return json(tokens("fresh", "r2"));
    return json({});
  };
  await client.signIn({});
  await client.api("/me");
  assert.deepEqual(calls, ["/api/auth/login", "/api/auth/refresh", "/api/me"]);
});

test("refresh rejection clears session and does not loop", async () => {
  const client = await fresh();
  let rotations = 0;
  globalThis.fetch = async (path) => {
    if (path.endsWith("/login")) return json(tokens());
    if (path.endsWith("/refresh")) rotations++;
    return json({ title: "Unauthorized" }, 401);
  };
  await client.signIn({});
  await assert.rejects(client.api("/me"), (error) => error.status === 401);
  assert.equal(rotations, 1);
  assert.equal(client.getSession(), null);
});

test("refresh server failures keep session for a retry and do not loop", async () => {
  const client = await fresh();
  globalThis.fetch = async (path) =>
    path.endsWith("/login")
      ? json(tokens("expired", "r", 0))
      : json({ title: "Server error" }, 500);
  await client.signIn({});
  await assert.rejects(client.api("/me"), (error) => error.status === 500);
  assert.ok(client.getSession());
});

test("a blocked session is cleared if retried protected request remains unauthorized", async () => {
  const client = await fresh();
  globalThis.fetch = async (path) =>
    path.endsWith("/login") || path.endsWith("/refresh")
      ? json(tokens())
      : json({}, 401);
  await client.signIn({});
  await assert.rejects(client.api("/me"), (error) => error.status === 401);
  assert.equal(client.getSession(), null);
});

test("logout waits for refresh rotation and revokes the newest token without bearer", async () => {
  const client = await fresh();
  let revoked;
  globalThis.fetch = async (path, init) => {
    if (path.endsWith("/login")) return json(tokens("old", "r1"));
    if (path.endsWith("/refresh")) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      return json(tokens("new", "r2"));
    }
    assert.equal(init.headers.has("Authorization"), false);
    revoked = JSON.parse(init.body).refreshToken;
    return json(null, 204);
  };
  await client.signIn({});
  await Promise.all([client.refreshSession(), client.signOut()]);
  assert.equal(revoked, "r2");
  assert.equal(client.getSession(), null);
});

test("validation errors preserve status and errors array", async () => {
  const client = await fresh();
  globalThis.fetch = async () =>
    json({ errors: ["name: must not be blank", "genres: invalid"] }, 400);
  await assert.rejects(
    client.signIn({}),
    (error) =>
      error.status === 400 &&
      error.problem.errors.length === 2 &&
      error.message.includes("name: must not be blank"),
  );
});

test("non-idempotent writes are not retried after server or network failures", async () => {
  const client = await fresh();
  let writes = 0;
  globalThis.fetch = async (path) => {
    if (path.endsWith("/login")) return json(tokens());
    writes++;
    throw new TypeError("offline");
  };
  await client.signIn({});
  await assert.rejects(
    client.write("/posts/id/shares", "POST"),
    (error) => error.status === 0,
  );
  assert.equal(writes, 1);
});

test("pagination follows all pages and encodes query values", async () => {
  const client = await fresh();
  const paths = [];
  globalThis.fetch = async (path) => {
    if (path.endsWith("/login")) return json(tokens());
    paths.push(path);
    const page = Number(
      new URL(path, "http://localhost").searchParams.get("page"),
    );
    return json({
      content: [{ id: String(page) }],
      number: page,
      size: 20,
      totalElements: 3,
      totalPages: 3,
    });
  };
  await client.signIn({});
  const result = await client.allPages("/users/me/following");
  assert.deepEqual(
    result.map((item) => item.id),
    ["0", "1", "2"],
  );
  assert.equal(paths.length, 3);
  const encoded = client.pagePath("/books", 0, {
    search: "Jane Austen & friends",
    genre: "science fiction",
  });
  const query = new URL(encoded, "http://localhost").searchParams;
  assert.equal(query.get("search"), "Jane Austen & friends");
  assert.equal(query.get("genre"), "science fiction");
});

test("empty paginated collection stops after its first page", async () => {
  const client = await fresh();
  let calls = 0;
  globalThis.fetch = async (path) => {
    if (path.endsWith("/login")) return json(tokens());
    calls++;
    return json({
      content: [],
      number: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
  };
  await client.signIn({});
  assert.deepEqual(await client.allPages("/clubs"), []);
  assert.equal(calls, 1);
});
