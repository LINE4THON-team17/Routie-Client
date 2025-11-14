import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/layout/layout";

import profileIcon from "../assets/icons/profile.svg";
import friendIcon from "../assets/icons/friendIcon.svg";
import shareIcon from "../assets/icons/shareIcon.svg";
import badge from "../assets/icons/badge.svg";
import followIcon from "../assets/icons/follow.svg";
import followDoneIcon from "../assets/icons/followDone.svg";

import { ShareUrlModal } from "../components/common/shareUrlModal";

import {
  getUserIdBySlug,
  getFollowStatus,
  followUser,
  unfollowUser,
  getUserProfileById,
  getUserRoutesById,
} from "../api/follow";

const getRouteId = (item) => item?.id ?? item?.routeId ?? item?.courseId;

const getThumbnailUrl = (item) => {
  if (!item) return "";

  if (typeof item.thumbnailUrl === "string" && item.thumbnailUrl)
    return item.thumbnailUrl;
  if (typeof item.thumbnail === "string" && item.thumbnail)
    return item.thumbnail;
  if (typeof item.thumbnailImageUrl === "string" && item.thumbnailImageUrl)
    return item.thumbnailImageUrl;
  if (typeof item.firstImageUrl === "string" && item.firstImageUrl)
    return item.firstImageUrl;

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

const getTitle = (item) =>
  item?.title ??
  item?.name ??
  item?.courseTitle ??
  item?.routeTitle ??
  "코스 제목";

export function SharedProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [targetUserId, setTargetUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const displayNickname = profile?.nickname || profile?.name || "친구 유저";

  const routeCount = routes.length;
  const badgeCount =
    routeCount >= 50 ? 3 : routeCount >= 10 ? 2 : routeCount >= 1 ? 1 : 0;

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const idRes = await getUserIdBySlug(slug).then((r) => r.data);
        const userId = idRes?.data ?? idRes;
        if (!userId) throw new Error("userId 없음");
        setTargetUserId(userId);

        const [profileRes, routesRes, statusRes] = await Promise.all([
          getUserProfileById(userId).then((r) => r.data),
          getUserRoutesById({ userId, page: 0, size: 20 }).then((r) => r.data),
          getFollowStatus(userId).then((r) => r.data),
        ]);

        const profileData = profileRes?.data || profileRes;
        const routesData = routesRes?.data || routesRes || [];
        const status = statusRes?.data || statusRes || {};

        setProfile(profileData);
        setRoutes(routesData);
        setIsFollowing(!!status.isFollowing);
      } catch (e) {
        console.error("[shared-profile] 데이터 로딩 실패", e);
        alert("프로필을 불러오는 데 실패했어요.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const handleToggleFollow = async () => {
    if (!targetUserId) return;
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setIsFollowing(false);
      } else {
        await followUser(targetUserId);
        setIsFollowing(true);
      }
    } catch (e) {
      console.error("[shared-profile] 팔로우 토글 실패", e);
      alert("팔로우 상태 변경 중 오류가 발생했어요.");
    }
  };

  const handleOpenShare = () => {
    setShareUrl(window.location.href);
    setShowShare(true);
  };

  if (loading) {
    return (
      <Layout type="logo">
        <Inner>로딩 중...</Inner>
      </Layout>
    );
  }

  return (
    <Layout type="logo">
      <Inner>
        {/* 프로필 영역 */}
        <ProfileRow>
          <ProfileImageWrapper>
            <img
              src={profile?.profileImageUrl || profileIcon}
              alt="프로필"
              width={84}
              height={84}
            />
          </ProfileImageWrapper>

          <UserCol>
            <UserName>{displayNickname}</UserName>
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

          <QuickBtn onClick={handleOpenShare}>
            <span>Share</span>
            <img src={shareIcon} alt="공유" />
          </QuickBtn>

          <QuickIconBtn onClick={handleToggleFollow}>
            <img
              src={isFollowing ? followDoneIcon : followIcon}
              alt={isFollowing ? "팔로우 완료" : "팔로우"}
            />
          </QuickIconBtn>
        </QuickRow>

        <Tabs>
          <Tab $active>루트</Tab>
          <TabRightText>{routeCount}개</TabRightText>
        </Tabs>

        <CardGrid>
          {routes.map((item) => {
            const routeId = getRouteId(item);
            const thumbUrl = getThumbnailUrl(item);
            const keyword = getKeyword(item);
            const title = getTitle(item);

            return (
              <Card
                key={routeId ?? Math.random()}
                onClick={() => {
                  if (!routeId) return;
                  navigate(`/course/${routeId}`);
                }}
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
              </Card>
            );
          })}
        </CardGrid>
      </Inner>

      {showShare && (
        <ShareUrlModal onClose={() => setShowShare(false)} url={shareUrl} />
      )}
    </Layout>
  );
}

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
  width: 84px;
  height: 84px;
  border-radius: 999px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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

const Tabs = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  background: #f4f4f5;
  padding: 0 20px;
`;

const Tab = styled.button`
  height: 44px;
  border: 0;
  background: transparent;
  font-weight: 400;
  border-bottom: 2px solid ${(p) => (p.$active ? "#222" : "transparent")};
`;

const TabRightText = styled.div`
  justify-self: end;
  font-size: 12px;
  color: #6b7280;
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
