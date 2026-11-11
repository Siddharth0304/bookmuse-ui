import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import SessionGate from "@/components/SessionGate";
const Login = lazy(() => import("@/pages/LoginPage"));
const Books = lazy(() => import("@/pages/BooksPage"));
const Book = lazy(() => import("@/pages/BookPage"));
const Community = lazy(() => import("@/pages/CommunityPage"));
const Post = lazy(() => import("@/pages/PostPage"));
const Clubs = lazy(() => import("@/pages/ClubsPage"));
const Club = lazy(() => import("@/pages/ClubPage"));
const Readers = lazy(() => import("@/pages/ReadersPage"));
const Profile = lazy(() => import("@/pages/ProfilePage"));
const Notifications = lazy(() => import("@/pages/NotificationsPage"));
const Admin = lazy(() => import("@/pages/AdminPage"));
const NotFound = lazy(() => import("@/pages/NotFoundPage"));
export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <SessionGate />,
    children: [
      {
        element: <App />,
        children: [
          { index: true, element: <Books key="discover" /> },
          {
            path: "recommendations",
            element: <Books key="recommendations" mode="recommendations" />,
          },
          { path: "library", element: <Books key="library" mode="library" /> },
          { path: "books/:id", element: <Book /> },
          { path: "community", element: <Community /> },
          { path: "posts/:id", element: <Post /> },
          { path: "clubs", element: <Clubs /> },
          { path: "clubs/:id", element: <Club /> },
          { path: "readers", element: <Readers /> },
          { path: "profile", element: <Profile key="me" /> },
          { path: "users/:id", element: <Profile /> },
          { path: "notifications", element: <Notifications /> },
          { path: "admin", element: <Admin /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);
