import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosInstance";

export const getRoutes = async () => {
  const res = await axiosInstance.get("/routes");
  return res.data.data;
};

export const getDetailRoute = async (routeId) => {
  const res = await axiosInstance.get(`/routes/${routeId}`);
  return res.data.data;
};

export function useCreateRoute() {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await axiosInstance.post(`/routes`, payload);
      return res.data;
    },
    onError: (err) => {
      console.error("코스 저장 실패:", err);
    },
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId) => {
      const res = await axiosInstance.post(`/routes/${routeId}/save`);
      return res.data;
    },
    onSuccess: () => {
      console.log("루트 저장 완료!");
      queryClient.invalidateQueries(["savedRoutes"]);
    },
  });
}

export function useUnsaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId) => {
      const res = await axiosInstance.delete(`/routes/${routeId}/save`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["savedRoutes"]);
    },
  });
}
