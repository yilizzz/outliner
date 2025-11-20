import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { createItem, readItems, deleteItem, updateItems } from "@directus/sdk";
import type { Schema } from "../lib/directus";
export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Schema["chapters"]) => {
      return directus.request(
        createItem("chapters", {
          project: data.projectId,
          title: data.title,
          content: data.content,
          sort: data.sort,
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

const updateChaptersOrder = async (updates: { id: string; sort: number }[]) => {
  const result = await directus.request(updateItems("chapter", updates));
  return result;
};

export const useUpdateChapterOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChaptersOrder,
    onMutate: async (newOrders) => {
      await queryClient.cancelQueries({ queryKey: ["chapters"] });
      const previous = queryClient.getQueryData<Schema["chapters"][]>([
        "chapters",
      ]);

      const updated = [...(previous || [])];
      newOrders.forEach(({ id, sort }) => {
        const idx = updated.findIndex((ch) => ch.id === id);
        if (idx !== -1) updated[idx] = { ...updated[idx], sort };
      });
      updated.sort((a, b) => a.sort - b.sort);

      queryClient.setQueryData(["chapters"], updated);
      return { previous };
    },
    onError: (err, vars, context) => {
      console.error("Update order failed:", err);
      if (context?.previous) {
        queryClient.setQueryData(["chapters"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
};
