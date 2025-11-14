// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/layout";

import profileIcon from "../assets/icons/profile.svg";
import friendIcon from "../assets/icons/friendIcon.svg";
import shareIcon from "../assets/icons/shareIcon.svg";
import settingIcon from "../assets/icons/settingIcon.svg";
import badge from "../assets/icons/badge.svg";

import { ShareUrlModal } from "../components/common/shareUrlModal";
import {
  getMyProfile,
  updateMyProfile,
  getSavedRoutes,
  getMyRoutes,
  createShareLink,
  getRouteDetailRaw, // ✅ 상세 조회
} from "../api/mypage";
import { requestLogout } from "../api/auth";

/** 공통: route id 뽑기 (saved 형식 등 모두 대응) */
const getRouteId = (item) => item?.id ?? item?.routeId ?? item?.courseId;

/** 업로드한 첫 번째 사진(썸네일) 추출 (내 루트 + 저장한 루트 공통) */
const getThumbnailUrl = (item) => {
  if (!item) return "";

  // 리스트 응답에 바로 있는 경우
  if (typeof item.thumbnailUrl === "string" && item.thumbnailUrl)
    return item.thumbnailUrl;
  if (typeof item.thumbnail === "string" && item.thumbnail)
    return item.thumbnail;
  if (typeof item.thumbnailImageUrl === "string" && item.thumbnailImageUrl)
    return item.thumbnailImageUrl;
  if (typeof item.firstImageUrl === "string" && item.firstImageUrl)
    return item.firstImageUrl;

  // 배열 안에 들어있는 경우들
  if (Array.isArray(item.images) && item.images[0]?.url)
    return item.images[0].url;
  if (Array.isArray(item.photos) && item.photos[0]?.url)
    return item.photos[0].url;
  if (Array.isArray(item.courseImages) && item.courseImages[0]?.imageUrl)
    return item.courseImages[0].imageUrl;
  if (Array.isArray(item.placeImages) && item.placeImages[0]?.imageUrl)
    return item.placeImages[0].imageUrl;

  // ✅ /api/routes/{routeId} 상세 응답 형식: data.places[0].photoUrl
  if (Array.isArray(item.places) && item.places.length > 0) {
    const first = item.places[0];
    if (first?.photoUrl) return first.photoUrl;
    if (Array.isArray(first?.images) && first.images[0]?.url)
      return first.images[0].url;
  }

  return "";
};

/** 키워드 하나 뽑기 (# 앞에 붙일 값) */
const getKeyword = (item) => {
  if (!item) return "";

  if (Array.isArray(item.keywords) && item.keywords.length > 0)
    return item.keywords[0];
  if (Array.isArray(item.hashtags) && item.hashtags.length > 0)
    return item.hashtags[0];
  if (Array.isArray(item.tags) && item.tags.length > 0) return item.tags[0];

  if (typeof item.keyword === "string") return item.keyword;
  if (typeof item.tag === "string") return item.tag;

  if (Array.isArray(item.keywordNames) && item.keywordNames.length > 0)
    return item.keywordNames[0];
  if (Array.isArray(item.keywordList) && item.keywordList.length > 0)
    return item.keywordList[0];

  return "";
};

/** 카드 제목 */
const getTitle = (item) =>
  item?.title ??
  item?.name ??
  item?.courseTitle ??
  item?.routeTitle ??
  "코스 제목";

export function MyPage() {
  const navigate = useNavigate();

  // 탭/수정/선택
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "saved"
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(new Set()); // routeId 집합

  // 데이터
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [myRoutes, setMyRoutes] = useState([]); // 내가 만든 루트 카드
  const [savedRoutes, setSavedRoutes] = useState([]); // 저장한 루트 카드

  // 공유 모달
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // 화면에 보여줄 닉네임
  const displayNickname =
    profile?.nickname || profile?.name || nickname || "유저아이디";

  /** 로그아웃 처리 */
  const handleLogout = async () => {
    try {
      await requestLogout();
    } catch (e) {
      console.error("[mypage] 로그아웃 실패", e);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  // 최초 로딩
  useEffect(() => {
    (async () => {
      // 1) 내 프로필
      try {
        const me = await getMyProfile().then((r) => r.data);
        const data = me?.data || me;

        const rawNickname = data?.nickname ?? data?.name ?? "";

        setProfile(data);
        setNickname(rawNickname);
        setProfileImageUrl(data?.profileImageUrl ?? "");
      } catch (e) {
        console.error("[mypage] 내 프로필 불러오기 실패", e);
      }

      // 공통: 리스트 -> 상세 붙이기
      const attachDetail = async (items, label) => {
        return Promise.all(
          items.map(async (item) => {
            const id = getRouteId(item);
            if (!id) return item;
            try {
              const detailRes = await getRouteDetailRaw(id);
              const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
              // detail에 keywords, places(photoUrl) 등이 들어있음
              const merged = { ...detail, ...item }; // 리스트 필드가 우선
              return merged;
            } catch (e) {
              console.error(
                `[mypage] ${label} route detail 불러오기 실패`,
                id,
                e
              );
              return item;
            }
          })
        );
      };

      // 2) 저장한 루트 (GET /api/users/me/saved) + 상세
      try {
        const savedRes = await getSavedRoutes({ page: 0, size: 20 }).then(
          (r) => r.data
        );
        const savedList = savedRes?.data ?? savedRes ?? [];
        const savedWithDetail = await attachDetail(savedList, "saved");
        setSavedRoutes(savedWithDetail);
      } catch (e) {
        console.error("[mypage] 저장한 루트 불러오기 실패", e);
        setSavedRoutes([]);
      }

      // 3) 내가 만든 루트 (리스트 + 상세)
      try {
        const myRes = await getMyRoutes({ page: 0, size: 20 }).then(
          (r) => r.data
        );
        const listRaw = myRes?.data ?? myRes ?? [];
        console.log("[mypage] myRoutes list raw:", listRaw);

        const withDetail = await attachDetail(listRaw, "mine");
        console.log("[mypage] myRoutes merged:", withDetail);
        setMyRoutes(withDetail);
      } catch (e) {
        console.error("[mypage] 내 루트 불러오기 실패", e);
        setMyRoutes([]);
      }
    })();
  }, []);

  const list = activeTab === "mine" ? myRoutes : savedRoutes;

  /** 수정 토글(저장 포함) */
  const toggleEdit = () => {
    if (editMode) {
      // 저장 모드: 닉네임 / 프로필 이미지 저장
      updateMyProfile({ nickname, profileImageUrl })
        .then((r) => {
          const data = r?.data?.data || r?.data;
          if (data) {
            setProfile(data);
            const rawNickname = data?.nickname ?? data?.name ?? nickname;
            setNickname(rawNickname);
            setProfileImageUrl(data.profileImageUrl ?? profileImageUrl);
          }
        })
        .finally(() => setEditMode(false));
    } else {
      // 수정 모드 진입
      setNickname(displayNickname || "");
      setProfileImageUrl(profile?.profileImageUrl ?? "");
      setEditMode(true);
    }
  };

  /** 공유 모달 오픈 */
  const openShare = async () => {
    if (!profile?.id) {
      setShareUrl(window.location.href);
      return setShowShare(true);
    }

    try {
      const res = await createShareLink(profile.id);
      const d = res?.data?.data || res?.data || {};
      const maybeUrl = d.url || d.link;
      const slug = d.slug;

      const finalUrl =
        maybeUrl ||
        (slug
          ? `${window.location.origin}/share/u/${slug}`
          : window.location.href);

      setShareUrl(finalUrl);
      setShowShare(true);
    } catch (e) {
      console.error("[mypage] 프로필 공유 링크 생성 실패", e);
      setShareUrl(window.location.href);
      setShowShare(true);
    }
  };

  /** 카드 선택/해제 (편집 모드에서만) */
  const onSelect = (routeId) => {
    if (!editMode || !routeId) return;
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(routeId) ? n.delete(routeId) : n.add(routeId);
      return n;
    });
  };

  /** 카드 클릭 → 상세 페이지로 이동 (편집 모드면 선택만) */
  const onCardClick = (item) => {
    const routeId = getRouteId(item);
    if (!routeId) return;

    if (editMode) return onSelect(routeId);
    navigate(`/course/${routeId}`); // ROUTES.COURSE = "/course/:id"
  };

  /** 삭제 실행 (API 붙으면 여기서 호출) */
  const onConfirmDelete = () => {
    if (activeTab === "saved") {
      setSavedRoutes((old) =>
        old.filter((it) => !selected.has(getRouteId(it)))
      );
    } else {
      setMyRoutes((old) => old.filter((it) => !selected.has(getRouteId(it))));
    }
    setSelected(new Set());
  };

  return (
    <Layout type="logo">
      <HeaderRight>
        <LogoutBtn onClick={handleLogout}>로그아웃</LogoutBtn>
      </HeaderRight>
      <Inner>
        {/* 프로필 영역 */}
        <ProfileRow>
          <img
            src={profile?.profileImageUrl || profileIcon}
            alt="프로필"
            width={84}
            height={84}
          />
          <UserCol>
            {!editMode ? (
              <UserName>{displayNickname}</UserName>
            ) : (
              <NickInput
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
              />
            )}
          </UserCol>
          <BadgeCol>
            <img src={badge} alt="뱃지" />
          </BadgeCol>
        </ProfileRow>

        {/* 퀵 액션 버튼 */}
        <QuickRow>
          <QuickBtn onClick={() => navigate("/routies")}>
            <span>Routies</span>
            <img src={friendIcon} alt="친구" />
          </QuickBtn>
          <QuickBtn onClick={openShare}>
            <span>Share</span>
            <img src={shareIcon} alt="공유" />
          </QuickBtn>
          <QuickIconBtn onClick={toggleEdit}>
            {!editMode ? (
              <img src={settingIcon} alt="설정" />
            ) : (
              <SaveBtn>save</SaveBtn>
            )}
          </QuickIconBtn>
        </QuickRow>

        {/* 프로필 이미지 URL 간단 수정 필드 */}
        {editMode && (
          <EditRow>
            <label>프로필 이미지 URL</label>
            <input
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </EditRow>
        )}

        {/* 탭 */}
        <Tabs>
          <Tab
            $active={activeTab === "mine"}
            onClick={() => setActiveTab("mine")}
          >
            나의 루트
          </Tab>
          <Divider />
          <Tab
            $active={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
          >
            저장한 루트
          </Tab>
        </Tabs>

        {/* 카드 그리드 */}
        <CardGrid>
          {list.map((item) => {
            const routeId = getRouteId(item);
            const thumbUrl = getThumbnailUrl(item);
            const keyword = getKeyword(item);
            const title = getTitle(item);

            return (
              <Card
                key={routeId ?? Math.random()}
                onClick={() => onCardClick(item)}
              >
                <Thumb
                  style={
                    thumbUrl
                      ? {
                          backgroundImage: `url(${thumbUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                />
                <CardOverlay>
                  <Small>{keyword ? `# ${keyword}` : "# 키워드"}</Small>
                  <Title>{title}</Title>
                </CardOverlay>
                {editMode && <SelectDot $active={selected.has(routeId)} />}
              </Card>
            );
          })}
        </CardGrid>

        {/* 삭제 버튼 (편집 모드 + 선택이 있을 때만) */}
        {editMode && selected.size > 0 && (
          <TrashFab
            onClick={() => {
              if (window.confirm("삭제하시겠습니까?")) onConfirmDelete();
            }}
          >
            🗑
          </TrashFab>
        )}
      </Inner>

      {/* 공유 모달 */}
      {showShare && (
        <ShareUrlModal onClose={() => setShowShare(false)} url={shareUrl} />
      )}
    </Layout>
  );
}

/* ========== styles ========== */
const HeaderRight = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px));
  right: 16px;
  height: 58px;
  display: flex;
  align-items: center;
  z-index: 20;
`;
const LogoutBtn = styled.button`
  border: 0;
  background: none;
  color: #fe5081;
  font-weight: 700;
  cursor: pointer;
`;
const Inner = styled.div`
  width: 100%;
  margin: 0 auto;
`;
const ProfileRow = styled.div`
  display: grid;
  grid-template-columns: 84px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 20px 20px 20px;
  background: #fff;
`;
const UserCol = styled.div`
  display: flex;
  align-items: center;
`;
const UserName = styled.h2`
  font-size: 22px;
  font-weight: 400;
`;
const NickInput = styled.input`
  font-size: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 6px 10px;
  width: 180px;
`;
const BadgeCol = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 8px;
`;
const QuickRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px 20px;
  background: #fff;
`;
const QuickBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  border-radius: var(--Radius-M, 13px);
  border: 0.5px solid var(--Color-gray, #858282);
  background: #fff;
  cursor: pointer;

  color: #111827;
  font-size: 14px;
  font-weight: 400;

  img {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;
const QuickIconBtn = styled.button`
  width: 45px;
  height: 45px;
  border-radius: var(--Radius-M, 13px);
  border: 0.5px solid var(--Color-gray, #858282);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }
`;
const SaveBtn = styled.span`
  width: 45px;
  height: 44px;
  border-radius: var(--Radius-M, 13px);
  background: #4ade80;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 400;
  color: #fff;
`;
const EditRow = styled.div`
  background: #fff;
  padding: 10px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  & > input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 10px;
  }
  & > label {
    font-size: 12px;
    color: #666;
  }
`;
const Tabs = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: center;
  background: #f4f4f5;
`;
const Tab = styled.button`
  height: 44px;
  border: 0;
  background: transparent;
  font-weight: 400;
  border-bottom: 2px solid ${(p) => (p.$active ? "#222" : "transparent")};
`;
const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: #dcdce1;
  justify-self: center;
`;
const CardGrid = styled.div`
  padding: 18px 19px 34px;
  gap: 10px;
  background: #f4f4f5;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  @media (min-width: 420px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;
const Card = styled.div`
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #c1c1c1;
  height: 180px;
`;
const Thumb = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #b4b4b4, #8f8f8f);
`;
const CardOverlay = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 10px 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.55) 95%
  );
  color: #fff;
`;
const Small = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;
const Title = styled.div`
  margin-top: 2px;
  font-weight: 700;
`;
const SelectDot = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${(p) => (p.$active ? "#ff5a84" : "#fff")};
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
`;
const TrashFab = styled.button`
  position: fixed;
  right: 20px;
  bottom: 96px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ff5a84;
  color: #fff;
  font-size: 22px;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  border: none;
`;
