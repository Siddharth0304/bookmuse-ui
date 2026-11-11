const base = import.meta.env?.VITE_API_BASE_URL || "/api";
let session = null;
let refreshRequest = null;
const listeners = new Set();
export const subscribeSession = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getSession = () => session;
function setSession(value) {
  session = value;
  listeners.forEach((listener) => listener());
}
export class ApiError extends Error {
  constructor(status, problem = {}) {
    super(
      problem.errors?.join("\n") ||
        problem.detail ||
        problem.title ||
        `Request failed (${status})`,
    );
    this.status = status;
    this.problem = problem;
  }
}
async function request(path, init = {}, accessToken) {
  const headers = new Headers(init.headers);
  if (init.body != null) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  let response;
  try {
    response = await fetch(base + path, { ...init, headers });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, {
      detail:
        "Cannot reach BookMuse. Check your connection and that the backend is running. The result of a submitted change may be unknown; check the collection before submitting it again.",
    });
  }
  if (!response.ok)
    throw new ApiError(
      response.status,
      await response.json().catch(() => ({})),
    );
  return response.status === 204 ? undefined : response.json();
}
export async function refreshSession() {
  if (!session)
    throw new ApiError(401, { detail: "Please sign in to continue." });
  if (!refreshRequest) {
    const original = session;
    refreshRequest = request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: original.refreshToken }),
    })
      .then((tokens) => {
        if (session === original)
          setSession({
            ...tokens,
            expiresAt: Date.now() + tokens.expiresIn * 1000,
          });
      })
      .catch((error) => {
        if (error.status === 401 && session === original) setSession(null);
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }
  return refreshRequest;
}
export async function api(path, init = {}) {
  if (!session)
    throw new ApiError(401, { detail: "Please sign in to continue." });
  if (session.expiresAt <= Date.now() + 5000) await refreshSession();
  if (!session)
    throw new ApiError(401, { detail: "Please sign in to continue." });
  const original = session;
  try {
    return await request(path, init, original.accessToken);
  } catch (error) {
    if (error.status !== 401) throw error;
    if (session === original) await refreshSession();
    if (!session) throw error;
    try {
      return await request(path, init, session.accessToken);
    } catch (retryError) {
      if (retryError.status === 401) setSession(null);
      throw retryError;
    }
  }
}
export async function signIn(values, register = false) {
  const tokens = await request(register ? "/auth/register" : "/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
  setSession({ ...tokens, expiresAt: Date.now() + tokens.expiresIn * 1000 });
}
export async function signOut() {
  // Wait for a rotating token so logout revokes the latest refresh token.
  if (refreshRequest) await refreshRequest;
  const original = session;
  if (!original) return;
  await request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken: original.refreshToken }),
  });
  if (session === original) setSession(null);
}
export const write = (path, method, body) =>
  api(path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
export function pagePath(path, page = 0, params = {}) {
  const query = new URLSearchParams({ page: String(page), size: "20" });
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value != null) query.set(key, String(value));
  });
  return `${path}?${query}`;
}
export async function allPages(path, params = {}, signal) {
  const content = [];
  let page = 0;
  while (true) {
    const result = await api(pagePath(path, page, params), { signal });
    content.push(...result.content);
    if (result.number + 1 >= result.totalPages) return content;
    page = result.number + 1;
  }
}
