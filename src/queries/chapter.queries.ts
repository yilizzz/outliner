import { useQuery, useMutation } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { createItem, readItems } from "@directus/sdk";

export const useCreateChapter = () => {
  return useMutation({
    mutationFn: async (data: {
      projectId: string;
      title: string;
      content?: string | null;
      sort?: string | null;
    }) => {
      return directus.request(
        createItem("chapters", {
          project: data.projectId,
          title: data.title,
          content: data.content || null,
          sort: data.sort || null,
        })
      );
    },
  });
};
export const useFetchChaptersByProjectId = (projectId: string | null) => {
  return useQuery({
    queryKey: ["chapters", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      return directus.request(
        readItems("chapters", {
          filter: { project: { _eq: projectId } },
          fields: ["id", "title", "content", "sort"],
          sort: ["sort"],
        })
      );
    },
    enabled: !!projectId,
  });
};
