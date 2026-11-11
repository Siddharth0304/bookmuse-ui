import { findBooksByGenres } from "@/api/books";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import {
  api,
  allPages,
  getSession,
  pagePath,
  subscribeSession,
  write,
} from "@/api/client";
export const useSession = () =>
  useSyncExternalStore(subscribeSession, getSession, getSession);
export const useResource = (path, enabled = true, options = {}) =>
  useQuery({
    queryKey: ["api", path],
    queryFn: ({ signal }) => api(path, { signal }),
    enabled: enabled && !!getSession(),
    ...options,
  });
export const useAll = (path, enabled = true) =>
  useQuery({
    queryKey: ["api", path, "all"],
    queryFn: ({ signal }) => allPages(path, {}, signal),
    enabled: enabled && !!getSession(),
  });
export const useCollection = (path, params = {}, enabled = true) =>
  useInfiniteQuery({
    queryKey: ["api", path, "pages", params],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      api(pagePath(path, pageParam, params), { signal }),
    getNextPageParam: (last) =>
      last.number + 1 < last.totalPages ? last.number + 1 : undefined,
    enabled: enabled && !!getSession(),
  });
export const items = (query) =>
  query.data?.pages.flatMap((page) => page.content) || [];
export function useAction(onSuccess) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, method = "PUT", body }) => write(path, method, body),
    retry: false,
    onSuccess: async (data) => {
      await client.invalidateQueries({ queryKey: ["api"] });
      onSuccess?.(data);
    },
  });
}

export const useBooksByGenres = (search, genres, enabled) =>
  useQuery({
    queryKey: ["api", "/books", "genres", search, genres],
    queryFn: ({ signal }) => findBooksByGenres(search, genres, signal),
    enabled: enabled && !!getSession(),
  });
