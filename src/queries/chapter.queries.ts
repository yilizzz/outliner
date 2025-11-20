import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { createItem, readItems, deleteItem } from "@directus/sdk";

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
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
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(["chapters"]);
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
export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chapterId: string) => {
      return directus.request(deleteItem("chapters", chapterId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["chapters"]);
    },
  });
};
