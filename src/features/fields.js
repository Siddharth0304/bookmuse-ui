export const bodyFields = [
  {
    name: "body",
    label: "Your thoughts",
    required: true,
    max: 10000,
    multiline: true,
  },
];
export const clubFields = [
  { name: "name", label: "Club name", required: true, max: 100 },
  { name: "description", label: "Description", max: 10000, multiline: true },
];
export const discussionFields = [
  { name: "title", label: "Discussion title", required: true, max: 255 },
  ...bodyFields,
];
export const bookFields = [
  { name: "title", label: "Title", required: true, max: 255 },
  { name: "author", label: "Author", required: true, max: 255 },
  { name: "genres", label: "Genres", required: true, labels: true },
  { name: "summary", label: "Summary", max: 10000, multiline: true },
  { name: "coverUrl", label: "Cover URL", type: "url", max: 255 },
];
export const profileFields = [
  { name: "name", label: "Name", required: true, max: 100 },
  { name: "bio", label: "Bio", max: 2000, multiline: true },
  { name: "avatarUrl", label: "Avatar URL", type: "url", max: 255 },
  { name: "favouriteGenres", label: "Favourite genres", labels: true },
];
export const libraryFields = [
  {
    name: "status",
    label: "Reading status",
    required: true,
    default: "WANT_TO_READ",
    options: [
      ["WANT_TO_READ", "Want to read"],
      ["READING", "Currently reading"],
      ["READ", "Finished"],
    ],
  },
  {
    name: "progress",
    label: "Progress (%)",
    type: "number",
    min: 0,
    maxValue: 100,
  },
];
