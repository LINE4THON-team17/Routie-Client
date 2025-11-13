// src/api/mypage.js
import { axiosInstance } from "./axiosInstance";

/** 내 프로필 조회/수정 */
export const getMyProfile = () => axiosInstance.get("/users/me");

export const updateMyProfile = (payload) =>
  axiosInstance.patch("/users/me", payload);

/** 저장한 루트 목록 (page: 0부터) */
export const getSavedRoutes = ({ page = 0, size = 20 } = {}) =>
  axiosInstance.get("/users/me/saved", { params: { page, size } });

/** 내 친구 목록 */
export const getMyFriends = () => axiosInstance.get("/users/me/friends");

/** 프로필 공유 링크 발급 */
export const createShareLink = (userId) =>
  axiosInstance.post(`/users/${userId}/share`);

/** 루트 상세 (card에 필요한 데이터 뽑기용) */
export const getRouteDetailRaw = (routeId) =>
  axiosInstance.get(`/routes/${routeId}`);

/** 여러 routeId -> 카드용 요약으로 하이드레이트 (백에 요약목록 없을 때 사용) */
export const hydrateRoutesByIds = async (ids = []) => {
  if (!ids.length) return [];

  const settled = await Promise.allSettled(
    ids.map((id) => getRouteDetailRaw(id))
  );

  return settled
    .filter((s) => s.status === "fulfilled")
    .map((s) => {
      const body = s.value?.data;
      const d = body?.data || body;
      return {
        id: d.routeId ?? d.id,
        title: d.title,
        thumbnail: d.places?.[0]?.photoUrl ?? "",
        distance: d.distance ?? null,
        duration: d.duration ?? null,
        keywords: d.keywords ?? [],
      };
    });
};
