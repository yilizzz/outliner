import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { readItems } from "@directus/sdk";

export const useFetchNews = (page = 1, limit = 6, lang = "en") => {
  const query = useQuery({
    queryKey: ["news", page, limit],
    queryFn: async () => {
      const offset = (page - 1) * limit;
      // request both language fields so the client can switch without refetch
      const raw = await directus.request(
        readItems("tech_news", {
          fields: [
            "url",
            "title",
            "title_zh",
            "summary",
            "summary_zh",
            "inspiration",
            "inspiration_zh",
            "category",
            "published_at",
            "tags",
            "tags_zh",
          ],
          sort: ["-published_at"],
          limit,
          offset,
        })
      );

      return raw || [];
    },
  });

  const mapped = useMemo(() => {
    const raw = query.data || [];
    return raw.map((it: any) => ({
      url: it.url,
      title: lang === "en" ? it.title : it.title_zh || it.title,
      summary: lang === "en" ? it.summary : it.summary_zh || it.summary,
      inspiration:
        lang === "en" ? it.inspiration : it.inspiration_zh || it.inspiration,
      category: it.category,
      published_at: it.published_at,
      tags: lang === "en" ? it.tags : it.tags_zh || it.tags,
    }));
  }, [query.data, lang]);

  return {
    ...query,
    data: mapped,
  };
};
