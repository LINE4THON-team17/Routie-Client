import { axiosInstance } from "./axiosInstance";

export const getMyProfile = () => axiosInstance.get("/users/me");

export const updateMyProfile = (payload) =>
  axiosInstance.patch("/users/me", payload);

//저장한 루트 목록
export const getSavedRoutes = ({ page = 0, size = 20 } = {}) =>
  axiosInstance.get("/users/me/saved", { params: { page, size } });

//친구 목록
export const getMyFriends = () => axiosInstance.get("/users/me/friends");

//프로필 링크 공유
export const createShareLink = (userId) =>
  axiosInstance.post(`/users/${userId}/share`);

//만든 루트 목록
export const getMyRoutes = ({ page = 0, size = 20 } = {}) =>
  axiosInstance.get("/users/me/routes", { params: { page, size } });

//루트 상세
export const getRouteDetailRaw = (routeId) =>
  axiosInstance.get(`/routes/${routeId}`);

//만든 루트 삭제
export const deleteMyRoute = (routeId) =>
  axiosInstance.delete(`/routes/${routeId}`);

//저장한 루트 삭제
export const deleteSavedRoute = (routeId) =>
  axiosInstance.delete(`/routes/${routeId}/save`);
