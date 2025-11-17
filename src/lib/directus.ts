import { createDirectus, authentication, rest } from "@directus/sdk";
if (!import.meta.env.VITE_DIRECTUS_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_DIRECTUS_URL");
}

export interface Schema {
  projects: {
    title: string;
  };
  chapters: {
    id: string;
    project: string;
    title: string;
    content: string;
    sort: string;
  };
  users: {
    id: string;
  };
}
export const directus = createDirectus<Schema>(
  import.meta.env.VITE_DIRECTUS_URL
)
  .with(rest())
  .with(authentication());
