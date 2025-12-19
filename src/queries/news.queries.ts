import { useInfiniteQuery } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { readItems } from "@directus/sdk";

const fetchNews = async ({
  pageParam = 1,
  limit = 6,
  lang = "en",
  category,
  searchKeyword,
}: {
  pageParam: number;
  limit: number;
  lang: "en" | "zh";
  category?: string[];
  searchKeyword?: string;
}) => {
  const offset = (pageParam - 1) * limit;

  // 构建 filter 对象
  let filter: any = {};

  const hasCategory = Array.isArray(category) && category.length > 0;
  const keyword = searchKeyword?.trim();
  const hasKeyword = !!keyword;

  // 1. 处理分类条件
  if (hasCategory) {
    filter.category = { _in: category };
  }

  // 2. 处理关键词条件（多字段 OR）
  if (hasKeyword) {
    const keywordFilter = {
      _or: [
        { title: { _icontains: keyword } },
        { title_zh: { _icontains: keyword } },
        { summary: { _icontains: keyword } },
        { summary_zh: { _icontains: keyword } },
      ],
    };

    if (hasCategory) {
      // 情况 2: category AND (keyword OR ...)
      filter = { _and: [filter, keywordFilter] };
    } else {
      // 情况 1: 只有 keyword
      filter = keywordFilter;
    }
  }
  const queryConfig: any = {
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
    ],
    sort: ["-published_at"],
    limit,
    offset,
    ...(Object.keys(filter).length > 0 ? { filter } : null),
  };
  let raw;
  try {
    raw = await directus.request(readItems("tech_news", queryConfig));
  } catch (err: any) {
    try {
      console.error("Directus fetchNews error:", {
        message: err?.message,
        status: err?.response?.status || err?.status || null,
        data: err?.response?.data || null,
        queryConfig,
      });
    } catch (e) {
      console.error("Directus fetchNews unknown error", err);
    }
    throw err;
  }
  const mapped = (raw || []).map((it: any) => ({
    url: it.url,
    title: lang === "en" ? it.title : it.title_zh || it.title,
    summary: lang === "en" ? it.summary : it.summary_zh || it.summary,
    inspiration:
      lang === "en" ? it.inspiration : it.inspiration_zh || it.inspiration,
    category: it.category,
    published_at: it.published_at,
  }));

  return {
    data: mapped,
    nextPage: pageParam + 1,
  };
};

export const useInfiniteFetchNews = (
  limit = 6,
  lang = "en",
  category = [],
  searchKeyword = ""
) => {
  return useInfiniteQuery({
    queryKey: ["news", limit, lang, category, searchKeyword],
    queryFn: ({ pageParam = 1 }) =>
      fetchNews({ pageParam, limit, lang, category, searchKeyword }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.length === limit ? lastPage.nextPage : undefined,
  });
};
