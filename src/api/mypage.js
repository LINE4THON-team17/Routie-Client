import { axiosInstance } from "./axiosInstance";

// /** 내 프로필 조회/수정 */
export const getMyProfile = () => axiosInstance.get("/users/me");

export const updateMyProfile = (payload) =>
  axiosInstance.patch("/users/me", payload);

// /** 저장한 루트 목록*/
export const getSavedRoutes = ({ page = 0, size = 20 } = {}) =>
  axiosInstance.get("/users/me/saved", { params: { page, size } });

/** 내 친구 목록 */
export const getMyFriends = () => axiosInstance.get("/users/me/friends");

// /** 프로필 공유 링크 발급 */
export const createShareLink = (userId) =>
  axiosInstance.post(`/users/${userId}/share`);

/** 내가 만든 루트 목록 (page: 0부터) */
export const getMyRoutes = ({ page = 0, size = 20 } = {}) =>
  axiosInstance.get("/users/me/routes", { params: { page, size } });

// /** 루트 상세*/
export const getRouteDetailRaw = (routeId) =>
  axiosInstance.get(`/routes/${routeId}`);

/** 내가 만든 루트 삭제 */
export const deleteMyRoute = (routeId) =>
  axiosInstance.delete(`/routes/${routeId}`);

/** 저장한 루트 삭제(언팔로우 느낌) */
export const deleteSavedRoute = (routeId) =>
  axiosInstance.delete(`/routes/${routeId}/save`);
