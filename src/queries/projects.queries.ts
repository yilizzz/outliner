import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directus } from "../lib/directus";
import { createItem, readItems, deleteItem, updateItem } from "@directus/sdk";

export const useFetchUserProjects = (userId: string | null) => {
  return useQuery({
    queryKey: ["projects", userId],
    queryFn: async () => {
      if (!userId) return [];
      return directus.request(
        readItems("projects", {
          filter: { user_created: { _eq: userId } },
          fields: ["id", "title", "date_created", "date_updated"],
          sort: ["-date_created"],
        })
      );
    },
    enabled: !!userId,
  });
};

export const useCreateProject = (userId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      if (!userId) {
        throw new Error("userId is required");
      }
      return directus.request(
        createItem("projects", {
          title: data.title,
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", userId] });
    },
  });
};

export const useUpdateProject = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; title: string }) => {
      return directus.request(
        updateItem("projects", data.id, {
          title: data.title,
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
};

export const useDeleteProject = (userId: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      return directus.request(deleteItem("projects", projectId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", userId] });
    },
  });
};
export const useFetchProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const projects = await directus.request(
        readItems("projects", {
          filter: { id: { _eq: projectId } },
          fields: ["id", "title", "chapters", "date_updated"],
        })
      );
      return projects[0] || null;
    },
    enabled: !!projectId,
  });
};
