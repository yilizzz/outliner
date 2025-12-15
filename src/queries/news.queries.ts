import { useQuery } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { readItems } from "@directus/sdk";

export const useFetchNews = (page = 1, limit = 6) => {
  return useQuery({
    queryKey: ["news", page, limit],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      return directus.request(
        readItems("tech_news", {
          fields: [
            "url",
            "title",
            "summary",
            "inspiration",
            "category",
            "published_at",
          ],
          sort: ["-published_at"],
          limit,
          offset,
        })
      );
    },
  });
};
