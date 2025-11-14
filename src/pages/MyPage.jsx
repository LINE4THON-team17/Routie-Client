import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/layout";

import profileIcon from "../assets/icons/profile.svg";
import friendIcon from "../assets/icons/friendIcon.svg";
import shareIcon from "../assets/icons/shareIcon.svg";
import settingIcon from "../assets/icons/settingIcon.svg";
import badge from "../assets/icons/badge.svg";

import rotiePrf from "../assets/icons/rotiePrf.svg";
import routieMePrf from "../assets/icons/routieMePrf.svg";
import cameraIcon from "../assets/icons/cameraIcon.svg";

import { ShareUrlModal } from "../components/common/shareUrlModal";
import {
  getMyProfile,
  updateMyProfile,
  getSavedRoutes,
  getMyRoutes,
  createShareLink,
  getRouteDetailRaw,
  deleteMyRoute,
  deleteSavedRoute,
} from "../api/mypage";
import { requestLogout } from "../api/auth";

const PROFILE_DEFAULTS = [rotiePrf, routieMePrf];

//route id 뽑기
const getRouteId = (item) => item?.id ?? item?.routeId ?? item?.courseId;

// 카드 썸네일
const getThumbnailUrl = (item) => {
  if (!item) return "";

  //응답에 바로 있음
  if (typeof item.thumbnailUrl === "string" && item.thumbnailUrl)
    return item.thumbnailUrl;
  if (typeof item.thumbnail === "string" && item.thumbnail)
    return item.thumbnail;
  if (typeof item.thumbnailImageUrl === "string" && item.thumbnailImageUrl)
    return item.thumbnailImageUrl;
  if (typeof item.firstImageUrl === "string" && item.firstImageUrl)
    return item.firstImageUrl;

  //배열
  if (Array.isArray(item.images) && item.images[0]?.url)
    return item.images[0].url;
  if (Array.isArray(item.photos) && item.photos[0]?.url)
    return item.photos[0].url;
  if (Array.isArray(item.courseImages) && item.courseImages[0]?.imageUrl)
    return item.courseImages[0].imageUrl;
  if (Array.isArray(item.placeImages) && item.placeImages[0]?.imageUrl)
    return item.placeImages[0].imageUrl;

  if (Array.isArray(item.places) && item.places.length > 0) {
    const first = item.places[0];
    if (first?.photoUrl) return first.photoUrl;
    if (Array.isArray(first?.images) && first.images[0]?.url)
      return first.images[0].url;
  }

  return "";
};

//키워드
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

//제목
const getTitle = (item) =>
  item?.title ??
  item?.name ??
  item?.courseTitle ??
  item?.routeTitle ??
  "코스 제목";

export function MyPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("mine");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [myRoutes, setMyRoutes] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);

  // 공유 모달
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const fileInputRef = useRef(null);

  const displayNickname =
    profile?.nickname || profile?.name || nickname || "유저아이디";

  //뱃지
  const myRouteCount = myRoutes.length;
  const badgeCount =
    myRouteCount >= 50 ? 3 : myRouteCount >= 10 ? 2 : myRouteCount >= 1 ? 1 : 0;

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

  const handleProfileClick = () => {
    if (!editMode || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setProfileImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    (async () => {
      try {
        const me = await getMyProfile().then((r) => r.data);
        const data = me?.data || me;

        const rawNickname = data?.nickname ?? data?.name ?? "";
        let img = data?.profileImageUrl ?? "";

        if (!img) {
          const randomImg =
            PROFILE_DEFAULTS[
              Math.floor(Math.random() * PROFILE_DEFAULTS.length)
            ];
          img = randomImg;
          try {
            await updateMyProfile({ profileImageUrl: randomImg });
          } catch (e) {
            console.error("[mypage] 기본 프로필 저장 실패", e);
          }
        }

        setProfile(data);
        setNickname(rawNickname);
        setProfileImageUrl(img);
      } catch (e) {
        console.error("[mypage] 내 프로필 불러오기 실패", e);
      }

      const attachDetail = async (items, label) => {
        return Promise.all(
          items.map(async (item) => {
            const id = getRouteId(item);
            if (!id) return item;
            try {
              const detailRes = await getRouteDetailRaw(id);
              const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
              const merged = { ...detail, ...item };
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

      try {
        const myRes = await getMyRoutes({ page: 0, size: 20 }).then(
          (r) => r.data
        );
        const listRaw = myRes?.data ?? myRes ?? [];
        const withDetail = await attachDetail(listRaw, "mine");
        setMyRoutes(withDetail);
      } catch (e) {
        console.error("[mypage] 내 루트 불러오기 실패", e);
        setMyRoutes([]);
      }
    })();
  }, []);

  const list = activeTab === "mine" ? myRoutes : savedRoutes;

  const toggleEdit = () => {
    if (editMode) {
      updateMyProfile({ nickname, profileImageUrl })
        .then((r) => {
          const data = r?.data?.data || r?.data;
          if (data) {
            setProfile(data);
            const rawNickname = data?.nickname ?? data?.name ?? nickname;
            setNickname(rawNickname);
            setProfileImageUrl(
              data.profileImageUrl ?? profileImageUrl ?? profileIcon
            );
          }
        })
        .finally(() => setEditMode(false));
    } else {
      setNickname(displayNickname || "");
      setEditMode(true);
    }
  };

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

  const onSelect = (routeId) => {
    if (!editMode || !routeId) return;
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(routeId) ? n.delete(routeId) : n.add(routeId);
      return n;
    });
  };

  const onCardClick = (item) => {
    const routeId = getRouteId(item);
    if (!routeId) return;

    if (editMode) return onSelect(routeId);
    navigate(`/course/${routeId}`);
  };

  const onConfirmDelete = async () => {
    const routeIds = Array.from(selected);
    if (routeIds.length === 0) return;

    try {
      if (activeTab === "saved") {
        await Promise.all(routeIds.map((id) => deleteSavedRoute(id)));

        setSavedRoutes((old) =>
          old.filter((it) => !routeIds.includes(getRouteIdForDetail(it)))
        );
      } else {
        await Promise.all(routeIds.map((id) => deleteMyRoute(id)));

        setMyRoutes((old) =>
          old.filter((it) => !routeIds.includes(getRouteIdForDetail(it)))
        );
      }
    } catch (e) {
      console.error("[mypage] 루트 삭제 실패", e);
      alert("삭제 중 오류가 발생했어요.");
    } finally {
      setSelected(new Set());
    }
  };

  return (
    <Layout type="logo">
      <HeaderRight>
        <LogoutBtn onClick={handleLogout}>로그아웃</LogoutBtn>
      </HeaderRight>
      <Inner>
        {/* 프로필 영역 */}
        <ProfileRow>
          <ProfileImageWrapper
            $editable={editMode}
            onClick={handleProfileClick}
          >
            <img
              src={profileImageUrl || profile?.profileImageUrl || profileIcon}
              alt="프로필"
              width={84}
              height={84}
            />
            {editMode && (
              <CameraOverlay>
                <img src={cameraIcon} alt="프로필 수정" />
              </CameraOverlay>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfileFileChange}
            />
          </ProfileImageWrapper>

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
            {Array.from({ length: badgeCount }).map((_, idx) => (
              <BadgeIcon key={idx} src={badge} alt="루트 뱃지" />
            ))}
          </BadgeCol>
        </ProfileRow>

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

        {editMode && selected.size > 0 && (
          <TrashFab
            onClick={async () => {
              if (window.confirm("삭제하시겠습니까?")) {
                await onConfirmDelete();
              }
            }}
          >
            🗑
          </TrashFab>
        )}
      </Inner>

      {showShare && (
        <ShareUrlModal onClose={() => setShowShare(false)} url={shareUrl} />
      )}
    </Layout>
  );
}

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
const ProfileImageWrapper = styled.div`
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 999px;
  overflow: hidden;
  cursor: ${(p) => (p.$editable ? "pointer" : "default")};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const CameraOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.35) 100%
  );
  img {
    width: 22px;
    height: 22px;
  }
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
  gap: 4px;
  padding-right: 8px;
`;
const BadgeIcon = styled.img`
  width: 30px;
  height: 30px;
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
