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
  hydrateRoutesByIds,
  createShareLink,
} from "../api/mypage";

export function MyPage() {
  const navigate = useNavigate();

  // 탭/수정/선택
  const [activeTab, setActiveTab] = useState("mine"); // "mine" | "saved"
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  // 데이터
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [myRoutes, setMyRoutes] = useState([]); // 내가 만든 루트 카드
  const [savedRoutes, setSavedRoutes] = useState([]); // 저장한 루트 카드

  // 공유 모달
  const [showShare, setShowShare] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // 화면에 보여줄 닉네임 (name / nickname 둘 다 대응, 빈 문자열이면 기본값)
  const displayNickname =
    profile?.nickname || profile?.name || nickname || "유저아이디";

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

      // 2) 저장한 루트 (GET /api/users/me/saved)
      try {
        const savedRes = await getSavedRoutes({ page: 0, size: 20 }).then(
          (r) => r.data
        );
        // 백엔드가 [] 혹은 { data: [] } 둘 다 대응
        const arr = savedRes?.data ?? savedRes ?? [];
        setSavedRoutes(arr);
      } catch (e) {
        // 실패해도 화면만 안 깨지게
        setSavedRoutes([]);
      }

      // 3) 내가 만든 루트: 로컬에 저장된 routeId 리스트 기준으로 하이드레이트
      try {
        const ids = JSON.parse(
          (typeof window !== "undefined" &&
            window.localStorage.getItem("myRouteIds")) ||
            "[]"
        );
        const arr = await hydrateRoutesByIds(ids);
        setMyRoutes(arr);
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
      // 수정 모드 진입: 입력 칸에 현재 닉네임/이미지 미리 넣기
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
  const onSelect = (id) => {
    if (!editMode) return;
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /** 카드 클릭 → 상세 페이지로 이동 (편집 모드면 선택만) */
  const onCardClick = (item) => {
    if (editMode) return onSelect(item.id);
    navigate(`/course/${item.id}`); // ROUTES.COURSE = "/course/:id"
  };

  /** 삭제 실행 (API 붙으면 여기서 호출) */
  const onConfirmDelete = () => {
    if (activeTab === "saved") {
      setSavedRoutes((old) => old.filter((it) => !selected.has(it.id)));
    } else {
      setMyRoutes((old) => old.filter((it) => !selected.has(it.id)));
    }
    setSelected(new Set());
  };

  return (
    <Layout type="logo">
      <HeaderRight>
        <LogoutBtn onClick={() => alert("로그아웃 처리 연결 예정")}>
          로그아웃
        </LogoutBtn>
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
            <img src={friendIcon} alt="친구" />
            <span>Routies</span>
          </QuickBtn>
          <QuickBtn onClick={openShare}>
            <img src={shareIcon} alt="공유" />
            <span>Share</span>
          </QuickBtn>
          <QuickBtn onClick={toggleEdit}>
            {!editMode ? (
              <img src={settingIcon} alt="설정" />
            ) : (
              <SaveBtn>save</SaveBtn>
            )}
          </QuickBtn>
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
          {list.map((item) => (
            <Card key={item.id} onClick={() => onCardClick(item)}>
              <Thumb
                style={
                  item.thumbnail
                    ? {
                        backgroundImage: `url(${item.thumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {}
                }
              />
              <CardOverlay>
                <Small>
                  {item.keywords?.length
                    ? `# ${item.keywords[0]}`
                    : item.distance != null && item.duration != null
                    ? `${item.distance}km · ${item.duration}min`
                    : "# 키워드"}
                </Small>
                <Title>{item.title || "코스 제목"}</Title>
              </CardOverlay>
              {editMode && <SelectDot $active={selected.has(item.id)} />}
            </Card>
          ))}
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
  gap: 16px;
  align-items: center;
  padding: 14px 0 10px;
  background: #fff;
  border-bottom: 1px solid #e9e9ed;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 14px 6px 18px;
  background: #fff;
`;
const QuickBtn = styled.button`
  background: #fff;
  border-radius: 8px;
  border: 0.5px solid #858282;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  color: #000;
  font-size: 12px;
  font-weight: 400;
`;
const SaveBtn = styled.span`
  background: #4ade80;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
  padding: 6px 10px;
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

// // // src/pages/MyPage.jsx
// // import React, { useEffect, useState } from "react";
// // import styled from "styled-components";
// // import { useNavigate } from "react-router-dom";
// // import { Layout } from "../components/layout/layout";

// // import profileIcon from "../assets/icons/profile.svg";
// // import friendIcon from "../assets/icons/friendIcon.svg";
// // import shareIcon from "../assets/icons/shareIcon.svg";
// // import settingIcon from "../assets/icons/settingIcon.svg";
// // import badge from "../assets/icons/badge.svg";

// // import { ShareUrlModal } from "../components/common/shareUrlModal";
// // import {
// //   getMyProfile,
// //   updateMyProfile,
// //   getSavedRoutes,
// //   hydrateRoutesByIds,
// //   createShareLink,
// // } from "../api/mypage"; // ✅ getMyRoutesSummary 제거

// // export function MyPage() {
// //   const navigate = useNavigate();

// //   // 탭/수정/선택
// //   const [activeTab, setActiveTab] = useState("mine"); // "mine" | "saved"
// //   const [editMode, setEditMode] = useState(false);
// //   const [selected, setSelected] = useState(new Set());

// //   // 데이터
// //   const [profile, setProfile] = useState(null);
// //   const [nickname, setNickname] = useState("");
// //   const [profileImageUrl, setProfileImageUrl] = useState("");

// //   const [myRoutes, setMyRoutes] = useState([]); // 내가 만든 루트 카드
// //   const [savedRoutes, setSavedRoutes] = useState([]); // 저장한 루트 카드

// //   // 공유 모달
// //   const [showShare, setShowShare] = useState(false);
// //   const [shareUrl, setShareUrl] = useState("");

// //   // 최초 로딩
// //   useEffect(() => {
// //     (async () => {
// //       // 1) 프로필
// //       try {
// //         const me = await getMyProfile().then((r) => r.data);
// //         const data = me?.data || me;
// //         setProfile(data);
// //         setNickname(data?.nickname ?? "");
// //         setProfileImageUrl(data?.profileImageUrl ?? "");
// //       } catch (e) {
// //         console.error("[mypage] 내 프로필 불러오기 실패", e);
// //       }

// //       // 2) 저장한 루트
// //       try {
// //         const savedRes = await getSavedRoutes({ page: 0, size: 20 }).then(
// //           (r) => r.data
// //         );
// //         const arr = savedRes?.data ?? savedRes ?? [];
// //         setSavedRoutes(arr);
// //       } catch (e) {
// //         console.error("[mypage] 저장한 루트 불러오기 실패", e);
// //         setSavedRoutes([]);
// //       }

// //       // 3) 내가 만든 루트: 로컬에 저장된 id 기준으로 하이드레이트
// //       try {
// //         const ids = JSON.parse(localStorage.getItem("myRouteIds") || "[]");
// //         const arr = await hydrateRoutesByIds(ids);
// //         setMyRoutes(arr);
// //       } catch (e) {
// //         console.error("[mypage] 내 루트 불러오기 실패", e);
// //         setMyRoutes([]);
// //       }
// //     })();
// //   }, []);

// //   const list = activeTab === "mine" ? myRoutes : savedRoutes;

// //   /** 수정 토글(저장 포함) */
// //   const toggleEdit = () => {
// //     if (editMode) {
// //       // 저장 모드
// //       updateMyProfile({ nickname, profileImageUrl })
// //         .then((r) => {
// //           const data = r?.data?.data || r?.data;
// //           if (data) setProfile(data);
// //         })
// //         .finally(() => setEditMode(false));
// //     } else {
// //       // 수정 모드 진입
// //       setEditMode(true);
// //     }
// //   };

// //   /** 공유 모달 오픈 */
// //   const openShare = async () => {
// //     if (!profile?.id) {
// //       setShareUrl(window.location.href);
// //       return setShowShare(true);
// //     }

// //     try {
// //       const res = await createShareLink(profile.id);
// //       const d = res?.data?.data || res?.data || {};
// //       const maybeUrl = d.url || d.link;
// //       const slug = d.slug;

// //       const finalUrl =
// //         maybeUrl ||
// //         (slug
// //           ? `${window.location.origin}/share/u/${slug}`
// //           : window.location.href);

// //       setShareUrl(finalUrl);
// //       setShowShare(true);
// //     } catch (e) {
// //       console.error("[mypage] 프로필 공유 링크 생성 실패", e);
// //       setShareUrl(window.location.href);
// //       setShowShare(true);
// //     }
// //   };

// //   /** 카드 선택/해제 (편집 모드에서만) */
// //   const onSelect = (id) => {
// //     if (!editMode) return;
// //     setSelected((prev) => {
// //       const n = new Set(prev);
// //       n.has(id) ? n.delete(id) : n.add(id);
// //       return n;
// //     });
// //   };

// //   /** 카드 클릭 → 상세로 이동 (편집 모드면 선택) */
// //   const onCardClick = (item) => {
// //     if (editMode) return onSelect(item.id);
// //     navigate(`/course/${item.id}`); // 필요하면 라우트 경로 맞게 수정
// //   };

// //   /** 삭제 실행 (API 스펙 오면 이 자리에서 호출) */
// //   const onConfirmDelete = () => {
// //     if (activeTab === "saved") {
// //       setSavedRoutes((old) => old.filter((it) => !selected.has(it.id)));
// //     } else {
// //       setMyRoutes((old) => old.filter((it) => !selected.has(it.id)));
// //     }
// //     setSelected(new Set());
// //   };

// //   return (
// //     <Layout type="logo">
// //       <HeaderRight>
// //         <LogoutBtn onClick={() => alert("로그아웃 처리 연결 예정")}>
// //           로그아웃
// //         </LogoutBtn>
// //       </HeaderRight>

// //       <Inner>
// //         {/* 프로필 영역 */}
// //         <ProfileRow>
// //           <img
// //             src={profile?.profileImageUrl || profileIcon}
// //             alt="프로필"
// //             width={84}
// //             height={84}
// //           />
// //           <UserCol>
// //             {!editMode ? (
// //               <UserName>{profile?.nickname || "유저아이디"}</UserName>
// //             ) : (
// //               <NickInput
// //                 value={nickname}
// //                 onChange={(e) => setNickname(e.target.value)}
// //                 placeholder="닉네임"
// //               />
// //             )}
// //           </UserCol>
// //           <BadgeCol>
// //             <img src={badge} alt="뱃지" />
// //           </BadgeCol>
// //         </ProfileRow>

// //         {/* 퀵 액션 */}
// //         <QuickRow>
// //           <QuickBtn onClick={() => navigate("/routies")}>
// //             <img src={friendIcon} alt="친구" />
// //             <span>Routies</span>
// //           </QuickBtn>
// //           <QuickBtn onClick={openShare}>
// //             <img src={shareIcon} alt="공유" />
// //             <span>Share</span>
// //           </QuickBtn>
// //           <QuickBtn onClick={toggleEdit}>
// //             {!editMode ? (
// //               <img src={settingIcon} alt="설정" />
// //             ) : (
// //               <SaveBtn>save</SaveBtn>
// //             )}
// //           </QuickBtn>
// //         </QuickRow>

// //         {/* 프로필 이미지 URL 간단 수정 필드 */}
// //         {editMode && (
// //           <EditRow>
// //             <label>프로필 이미지 URL</label>
// //             <input
// //               value={profileImageUrl}
// //               onChange={(e) => setProfileImageUrl(e.target.value)}
// //               placeholder="https://..."
// //             />
// //           </EditRow>
// //         )}

// //         {/* 탭 */}
// //         <Tabs>
// //           <Tab
// //             $active={activeTab === "mine"}
// //             onClick={() => setActiveTab("mine")}
// //           >
// //             나의 루트
// //           </Tab>
// //           <Divider />
// //           <Tab
// //             $active={activeTab === "saved"}
// //             onClick={() => setActiveTab("saved")}
// //           >
// //             저장한 루트
// //           </Tab>
// //         </Tabs>

// //         {/* 카드 그리드 */}
// //         <CardGrid>
// //           {list.map((item) => (
// //             <Card key={item.id} onClick={() => onCardClick(item)}>
// //               <Thumb
// //                 style={
// //                   item.thumbnail
// //                     ? {
// //                         backgroundImage: `url(${item.thumbnail})`,
// //                         backgroundSize: "cover",
// //                         backgroundPosition: "center",
// //                       }
// //                     : {}
// //                 }
// //               />
// //               <CardOverlay>
// //                 <Small>
// //                   {item.distance != null && item.duration != null
// //                     ? `${item.distance}km · ${item.duration}min`
// //                     : item.keywords?.length
// //                     ? `# ${item.keywords[0]}`
// //                     : "# 키워드"}
// //                 </Small>
// //                 <Title>{item.title || "코스 제목"}</Title>
// //               </CardOverlay>
// //               {editMode && <SelectDot $active={selected.has(item.id)} />}
// //             </Card>
// //           ))}
// //         </CardGrid>

// //         {/* 삭제 FAB */}
// //         {editMode && selected.size > 0 && (
// //           <TrashFab
// //             onClick={() => {
// //               if (window.confirm("삭제하시겠습니까?")) onConfirmDelete();
// //             }}
// //           >
// //             🗑
// //           </TrashFab>
// //         )}
// //       </Inner>

// //       {/* 공유 모달 */}
// //       {showShare && (
// //         <ShareUrlModal onClose={() => setShowShare(false)} url={shareUrl} />
// //       )}
// //     </Layout>
// //   );
// // }

// // /* ========== styles ========== */
// // const HeaderRight = styled.div`
// //   position: fixed;
// //   top: calc(env(safe-area-inset-top, 0px));
// //   right: 16px;
// //   height: 58px;
// //   display: flex;
// //   align-items: center;
// //   z-index: 20;
// // `;
// // const LogoutBtn = styled.button`
// //   border: 0;
// //   background: none;
// //   color: #fe5081;
// //   font-weight: 700;
// //   cursor: pointer;
// // `;
// // const Inner = styled.div`
// //   width: 100%;
// //   margin: 0 auto;
// // `;
// // const ProfileRow = styled.div`
// //   display: grid;
// //   grid-template-columns: 84px 1fr auto;
// //   gap: 16px;
// //   align-items: center;
// //   padding: 14px 0 10px;
// //   background: #fff;
// //   border-bottom: 1px solid #e9e9ed;
// // `;
// // const UserCol = styled.div`
// //   display: flex;
// //   align-items: center;
// // `;
// // const UserName = styled.h2`
// //   font-size: 22px;
// //   font-weight: 400;
// // `;
// // const NickInput = styled.input`
// //   font-size: 20px;
// //   border: 1px solid #ddd;
// //   border-radius: 8px;
// //   padding: 6px 10px;
// //   width: 180px;
// // `;
// // const BadgeCol = styled.div`
// //   display: flex;
// //   align-items: center;
// //   gap: 10px;
// //   padding-right: 8px;
// // `;
// // const QuickRow = styled.div`
// //   display: grid;
// //   grid-template-columns: repeat(3, 1fr);
// //   gap: 14px;
// //   padding: 14px 6px 18px;
// //   background: #fff;
// // `;
// // const QuickBtn = styled.button`
// //   background: #fff;
// //   border-radius: 8px;
// //   border: 0.5px solid #858282;
// //   display: flex;
// //   align-items: center;
// //   gap: 8px;
// //   justify-content: center;
// //   cursor: pointer;
// //   color: #000;
// //   font-size: 12px;
// //   font-weight: 400;
// // `;
// // const SaveBtn = styled.span`
// //   background: #4ade80;
// //   color: #fff;
// //   font-weight: 700;
// //   border-radius: 8px;
// //   padding: 6px 10px;
// // `;
// // const EditRow = styled.div`
// //   background: #fff;
// //   padding: 10px 12px;
// //   display: flex;
// //   gap: 8px;
// //   align-items: center;
// //   border-top: 1px solid #eee;
// //   border-bottom: 1px solid #eee;
// //   & > input {
// //     flex: 1;
// //     border: 1px solid #ddd;
// //     border-radius: 8px;
// //     padding: 8px 10px;
// //   }
// //   & > label {
// //     font-size: 12px;
// //     color: #666;
// //   }
// // `;
// // const Tabs = styled.div`
// //   margin-top: 10px;
// //   display: grid;
// //   grid-template-columns: 1fr 1px 1fr;
// //   align-items: center;
// //   background: #f4f4f5;
// // `;
// // const Tab = styled.button`
// //   height: 44px;
// //   border: 0;
// //   background: transparent;
// //   font-weight: 400;
// //   border-bottom: 2px solid ${(p) => (p.$active ? "#222" : "transparent")};
// // `;
// // const Divider = styled.div`
// //   width: 1px;
// //   height: 28px;
// //   background: #dcdce1;
// //   justify-self: center;
// // `;
// // const CardGrid = styled.div`
// //   padding: 18px 19px 34px;
// //   gap: 10px;
// //   background: #f4f4f5;
// //   display: grid;
// //   grid-template-columns: repeat(2, 1fr);
// //   @media (min-width: 420px) {
// //     grid-template-columns: repeat(3, 1fr);
// //   }
// // `;
// // const Card = styled.div`
// //   position: relative;
// //   border-radius: 14px;
// //   overflow: hidden;
// //   background: #c1c1c1;
// //   height: 180px;
// // `;
// // const Thumb = styled.div`
// //   width: 100%;
// //   height: 100%;
// //   background: linear-gradient(180deg, #b4b4b4, #8f8f8f);
// // `;
// // const CardOverlay = styled.div`
// //   position: absolute;
// //   left: 0;
// //   right: 0;
// //   bottom: 0;
// //   padding: 10px 12px;
// //   background: linear-gradient(
// //     180deg,
// //     rgba(0, 0, 0, 0) 0%,
// //     rgba(0, 0, 0, 0.55) 95%
// //   );
// //   color: #fff;
// // `;
// // const Small = styled.div`
// //   font-size: 12px;
// //   opacity: 0.9;
// // `;
// // const Title = styled.div`
// //   margin-top: 2px;
// //   font-weight: 700;
// // `;
// // const SelectDot = styled.div`
// //   position: absolute;
// //   top: 10px;
// //   right: 10px;
// //   width: 14px;
// //   height: 14px;
// //   border-radius: 50%;
// //   background: ${(p) => (p.$active ? "#ff5a84" : "#fff")};
// //   border: 2px solid #fff;
// //   box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
// // `;
// // const TrashFab = styled.button`
// //   position: fixed;
// //   right: 20px;
// //   bottom: 96px;
// //   width: 56px;
// //   height: 56px;
// //   border-radius: 50%;
// //   background: #ff5a84;
// //   color: #fff;
// //   font-size: 22px;
// //   display: grid;
// //   place-items: center;
// //   box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
// //   border: none;
// // `;

// // src/pages/MyPage.jsx
// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import { useNavigate } from "react-router-dom";
// import { Layout } from "../components/layout/layout";

// import profileIcon from "../assets/icons/profile.svg";
// import friendIcon from "../assets/icons/friendIcon.svg";
// import shareIcon from "../assets/icons/shareIcon.svg";
// import settingIcon from "../assets/icons/settingIcon.svg";
// import badge from "../assets/icons/badge.svg";

// import { ShareUrlModal } from "../components/common/shareUrlModal";
// import {
//   getMyProfile,
//   updateMyProfile,
//   getSavedRoutes,
//   hydrateRoutesByIds,
//   createShareLink,
// } from "../api/mypage";

// export function MyPage() {
//   const navigate = useNavigate();

//   // 탭/수정/선택
//   const [activeTab, setActiveTab] = useState("mine"); // "mine" | "saved"
//   const [editMode, setEditMode] = useState(false);
//   const [selected, setSelected] = useState(new Set());

//   // 데이터
//   const [profile, setProfile] = useState(null);
//   const [nickname, setNickname] = useState("");
//   const [profileImageUrl, setProfileImageUrl] = useState("");
//   const [myRoutes, setMyRoutes] = useState([]); // 내가 만든 루트 카드
//   const [savedRoutes, setSavedRoutes] = useState([]); // 저장한 루트 카드

//   // 공유 모달
//   const [showShare, setShowShare] = useState(false);
//   const [shareUrl, setShareUrl] = useState("");

//   // ✅ 화면에 보여줄 닉네임 (name / nickname 둘 다 대응, 빈 문자열이면 기본값)
//   const displayNickname =
//     profile?.nickname || profile?.name || nickname || "유저아이디";

//   // 최초 로딩
//   useEffect(() => {
//     (async () => {
//       // 1) 내 프로필
//       try {
//         const me = await getMyProfile().then((r) => r.data);
//         const data = me?.data || me;

//         // ✅ 서버가 nickname 또는 name 중 무엇을 줄지 모르니 둘 다 체크
//         const rawNickname = data?.nickname ?? data?.name ?? "";

//         setProfile(data);
//         setNickname(rawNickname);
//         setProfileImageUrl(data?.profileImageUrl ?? "");
//       } catch (e) {
//         console.error("[mypage] 내 프로필 불러오기 실패", e);
//       }

//       // 2) 저장한 루트
//       try {
//         const savedRes = await getSavedRoutes({ page: 0, size: 20 }).then(
//           (r) => r.data
//         );
//         const arr = savedRes?.data ?? savedRes ?? [];
//         setSavedRoutes(arr);
//       } catch (e) {
//         // 🔇 서버 500이라도 화면 깨지지 않게만 처리 (콘솔 로그는 지움/주석)
//         // console.error("[mypage] 저장한 루트 불러오기 실패", e);
//         setSavedRoutes([]);
//       }

//       // 3) 내가 만든 루트: 로컬에 저장된 routeId 리스트 기준으로 하이드레이트
//       try {
//         const ids = JSON.parse(
//           (typeof window !== "undefined" &&
//             window.localStorage.getItem("myRouteIds")) ||
//             "[]"
//         );
//         const arr = await hydrateRoutesByIds(ids);
//         setMyRoutes(arr);
//       } catch (e) {
//         console.error("[mypage] 내 루트 불러오기 실패", e);
//         setMyRoutes([]);
//       }
//     })();
//   }, []);

//   const list = activeTab === "mine" ? myRoutes : savedRoutes;

//   /** 수정 토글(저장 포함) */
//   const toggleEdit = () => {
//     if (editMode) {
//       // ✅ 저장 모드: 닉네임 / 프로필 이미지 저장
//       updateMyProfile({ nickname, profileImageUrl })
//         .then((r) => {
//           const data = r?.data?.data || r?.data;
//           if (data) {
//             setProfile(data);
//             const rawNickname = data?.nickname ?? data?.name ?? nickname;
//             setNickname(rawNickname);
//             setProfileImageUrl(data.profileImageUrl ?? profileImageUrl);
//           }
//         })
//         .finally(() => setEditMode(false));
//     } else {
//       // ✅ 수정 모드 진입: 입력 칸에 현재 닉네임/이미지 미리 넣기
//       setNickname(displayNickname || "");
//       setProfileImageUrl(profile?.profileImageUrl ?? "");
//       setEditMode(true);
//     }
//   };

//   /** 공유 모달 오픈 */
//   const openShare = async () => {
//     if (!profile?.id) {
//       setShareUrl(window.location.href);
//       return setShowShare(true);
//     }

//     try {
//       const res = await createShareLink(profile.id);
//       const d = res?.data?.data || res?.data || {};
//       const maybeUrl = d.url || d.link;
//       const slug = d.slug;

//       const finalUrl =
//         maybeUrl ||
//         (slug
//           ? `${window.location.origin}/share/u/${slug}`
//           : window.location.href);

//       setShareUrl(finalUrl);
//       setShowShare(true);
//     } catch (e) {
//       console.error("[mypage] 프로필 공유 링크 생성 실패", e);
//       setShareUrl(window.location.href);
//       setShowShare(true);
//     }
//   };

//   /** 카드 선택/해제 (편집 모드에서만) */
//   const onSelect = (id) => {
//     if (!editMode) return;
//     setSelected((prev) => {
//       const n = new Set(prev);
//       n.has(id) ? n.delete(id) : n.add(id);
//       return n;
//     });
//   };

//   /** 카드 클릭 → 상세 페이지로 이동 (편집 모드면 선택만) */
//   const onCardClick = (item) => {
//     if (editMode) return onSelect(item.id);
//     navigate(`/course/${item.id}`); // 필요하면 라우트 경로 맞게 수정
//   };

//   /** 삭제 실행 (API 붙으면 여기서 호출) */
//   const onConfirmDelete = () => {
//     if (activeTab === "saved") {
//       setSavedRoutes((old) => old.filter((it) => !selected.has(it.id)));
//     } else {
//       setMyRoutes((old) => old.filter((it) => !selected.has(it.id)));
//     }
//     setSelected(new Set());
//   };

//   return (
//     <Layout type="logo">
//       <HeaderRight>
//         <LogoutBtn onClick={() => alert("로그아웃 처리 연결 예정")}>
//           로그아웃
//         </LogoutBtn>
//       </HeaderRight>

//       <Inner>
//         {/* 프로필 영역 */}
//         <ProfileRow>
//           <img
//             src={profile?.profileImageUrl || profileIcon}
//             alt="프로필"
//             width={84}
//             height={84}
//           />
//           <UserCol>
//             {!editMode ? (
//               // ✅ 항상 회원가입 때 닉네임(또는 name) 보여줌
//               <UserName>{displayNickname}</UserName>
//             ) : (
//               // ✅ 수정 모드: 입력 칸에 기존 닉네임이 들어가 있음
//               <NickInput
//                 value={nickname}
//                 onChange={(e) => setNickname(e.target.value)}
//                 placeholder="닉네임"
//               />
//             )}
//           </UserCol>
//           <BadgeCol>
//             <img src={badge} alt="뱃지" />
//           </BadgeCol>
//         </ProfileRow>

//         {/* 퀵 액션 버튼 */}
//         <QuickRow>
//           <QuickBtn onClick={() => navigate("/routies")}>
//             <img src={friendIcon} alt="친구" />
//             <span>Routies</span>
//           </QuickBtn>
//           <QuickBtn onClick={openShare}>
//             <img src={shareIcon} alt="공유" />
//             <span>Share</span>
//           </QuickBtn>
//           <QuickBtn onClick={toggleEdit}>
//             {!editMode ? (
//               <img src={settingIcon} alt="설정" />
//             ) : (
//               <SaveBtn>save</SaveBtn>
//             )}
//           </QuickBtn>
//         </QuickRow>

//         {/* 프로필 이미지 URL 간단 수정 필드 */}
//         {editMode && (
//           <EditRow>
//             <label>프로필 이미지 URL</label>
//             <input
//               value={profileImageUrl}
//               onChange={(e) => setProfileImageUrl(e.target.value)}
//               placeholder="https://..."
//             />
//           </EditRow>
//         )}

//         {/* 탭 */}
//         <Tabs>
//           <Tab
//             $active={activeTab === "mine"}
//             onClick={() => setActiveTab("mine")}
//           >
//             나의 루트
//           </Tab>
//           <Divider />
//           <Tab
//             $active={activeTab === "saved"}
//             onClick={() => setActiveTab("saved")}
//           >
//             저장한 루트
//           </Tab>
//         </Tabs>

//         {/* 카드 그리드 */}
//         <CardGrid>
//           {list.map((item) => (
//             <Card key={item.id} onClick={() => onCardClick(item)}>
//               <Thumb
//                 style={
//                   item.thumbnail
//                     ? {
//                         backgroundImage: `url(${item.thumbnail})`,
//                         backgroundSize: "cover",
//                         backgroundPosition: "center",
//                       }
//                     : {}
//                 }
//               />
//               <CardOverlay>
//                 <Small>
//                   {item.distance != null && item.duration != null
//                     ? `${item.distance}km · ${item.duration}min`
//                     : item.keywords?.length
//                     ? `# ${item.keywords[0]}`
//                     : "# 키워드"}
//                 </Small>
//                 <Title>{item.title || "코스 제목"}</Title>
//               </CardOverlay>
//               {editMode && <SelectDot $active={selected.has(item.id)} />}
//             </Card>
//           ))}
//         </CardGrid>

//         {/* 삭제 버튼 (편집 모드 + 선택이 있을 때만) */}
//         {editMode && selected.size > 0 && (
//           <TrashFab
//             onClick={() => {
//               if (window.confirm("삭제하시겠습니까?")) onConfirmDelete();
//             }}
//           >
//             🗑
//           </TrashFab>
//         )}
//       </Inner>

//       {/* 공유 모달 */}
//       {showShare && (
//         <ShareUrlModal onClose={() => setShowShare(false)} url={shareUrl} />
//       )}
//     </Layout>
//   );
// }

// /* ========== styles ========== */
// const HeaderRight = styled.div`
//   position: fixed;
//   top: calc(env(safe-area-inset-top, 0px));
//   right: 16px;
//   height: 58px;
//   display: flex;
//   align-items: center;
//   z-index: 20;
// `;
// const LogoutBtn = styled.button`
//   border: 0;
//   background: none;
//   color: #fe5081;
//   font-weight: 700;
//   cursor: pointer;
// `;
// const Inner = styled.div`
//   width: 100%;
//   margin: 0 auto;
// `;
// const ProfileRow = styled.div`
//   display: grid;
//   grid-template-columns: 84px 1fr auto;
//   gap: 16px;
//   align-items: center;
//   padding: 14px 0 10px;
//   background: #fff;
//   border-bottom: 1px solid #e9e9ed;
// `;
// const UserCol = styled.div`
//   display: flex;
//   align-items: center;
// `;
// const UserName = styled.h2`
//   font-size: 22px;
//   font-weight: 400;
// `;
// const NickInput = styled.input`
//   font-size: 20px;
//   border: 1px solid #ddd;
//   border-radius: 8px;
//   padding: 6px 10px;
//   width: 180px;
// `;
// const BadgeCol = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 10px;
//   padding-right: 8px;
// `;
// const QuickRow = styled.div`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 14px;
//   padding: 14px 6px 18px;
//   background: #fff;
// `;
// const QuickBtn = styled.button`
//   background: #fff;
//   border-radius: 8px;
//   border: 0.5px solid #858282;
//   display: flex;
//   align-items: center;
//   gap: 8px;
//   justify-content: center;
//   cursor: pointer;
//   color: #000;
//   font-size: 12px;
//   font-weight: 400;
// `;
// const SaveBtn = styled.span`
//   background: #4ade80;
//   color: #fff;
//   font-weight: 700;
//   border-radius: 8px;
//   padding: 6px 10px;
// `;
// const EditRow = styled.div`
//   background: #fff;
//   padding: 10px 12px;
//   display: flex;
//   gap: 8px;
//   align-items: center;
//   border-top: 1px solid #eee;
//   border-bottom: 1px solid #eee;
//   & > input {
//     flex: 1;
//     border: 1px solid #ddd;
//     border-radius: 8px;
//     padding: 8px 10px;
//   }
//   & > label {
//     font-size: 12px;
//     color: #666;
//   }
// `;
// const Tabs = styled.div`
//   margin-top: 10px;
//   display: grid;
//   grid-template-columns: 1fr 1px 1fr;
//   align-items: center;
//   background: #f4f4f5;
// `;
// const Tab = styled.button`
//   height: 44px;
//   border: 0;
//   background: transparent;
//   font-weight: 400;
//   border-bottom: 2px solid ${(p) => (p.$active ? "#222" : "transparent")};
// `;
// const Divider = styled.div`
//   width: 1px;
//   height: 28px;
//   background: #dcdce1;
//   justify-self: center;
// `;
// const CardGrid = styled.div`
//   padding: 18px 19px 34px;
//   gap: 10px;
//   background: #f4f4f5;
//   display: grid;
//   grid-template-columns: repeat(2, 1fr);
//   @media (min-width: 420px) {
//     grid-template-columns: repeat(3, 1fr);
//   }
// `;
// const Card = styled.div`
//   position: relative;
//   border-radius: 14px;
//   overflow: hidden;
//   background: #c1c1c1;
//   height: 180px;
// `;
// const Thumb = styled.div`
//   width: 100%;
//   height: 100%;
//   background: linear-gradient(180deg, #b4b4b4, #8f8f8f);
// `;
// const CardOverlay = styled.div`
//   position: absolute;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   padding: 10px 12px;
//   background: linear-gradient(
//     180deg,
//     rgba(0, 0, 0, 0) 0%,
//     rgba(0, 0, 0, 0.55) 95%
//   );
//   color: #fff;
// `;
// const Small = styled.div`
//   font-size: 12px;
//   opacity: 0.9;
// `;
// const Title = styled.div`
//   margin-top: 2px;
//   font-weight: 700;
// `;
// const SelectDot = styled.div`
//   position: absolute;
//   top: 10px;
//   right: 10px;
//   width: 14px;
//   height: 14px;
//   border-radius: 50%;
//   background: ${(p) => (p.$active ? "#ff5a84" : "#fff")};
//   border: 2px solid #fff;
//   box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.15);
// `;
// const TrashFab = styled.button`
//   position: fixed;
//   right: 20px;
//   bottom: 96px;
//   width: 56px;
//   height: 56px;
//   border-radius: 50%;
//   background: #ff5a84;
//   color: #fff;
//   font-size: 22px;
//   display: grid;
//   place-items: center;
//   box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
//   border: none;
// `;

// // import React, { useMemo, useState } from "react";
// // import styled from "styled-components";
// // import { useNavigate } from "react-router-dom";
// // import { Layout } from "../components/layout/layout";
// // import profile from "../assets/icons/profile.svg";
// // import friendIcon from "../assets/icons/friendIcon.svg";
// // import shareIcon from "../assets/icons/shareIcon.svg";
// // import settingIcon from "../assets/icons/settingIcon.svg";
// // import badge from "../assets/icons/badge.svg";

// // export function MyPage() {
// //   const navigate = useNavigate();
// //   const [activeTab, setActiveTab] = useState("mine");

// //   // test 리스트
// //   const myRoutes = useMemo(
// //     () =>
// //       Array.from({ length: 7 }).map((_, i) => ({
// //         id: `mine-${i}`,
// //         keyword: "# 키워드",
// //         title: "코스 제목",
// //       })),
// //     []
// //   );
// //   const savedRoutes = useMemo(
// //     () =>
// //       Array.from({ length: 4 }).map((_, i) => ({
// //         id: `saved-${i}`,
// //         keyword: "# 키워드",
// //         title: "코스 제목",
// //       })),
// //     []
// //   );

// //   const list = activeTab === "mine" ? myRoutes : savedRoutes;

// //   return (
// //     <Layout type="logo">
// //       <HeaderRight>
// //         <LogoutBtn onClick={() => alert("로그아웃 처리 연결 예정")}>
// //           로그아웃
// //         </LogoutBtn>
// //       </HeaderRight>

// //       <Inner>
// //         <ProfileRow>
// //           <img src={profile} alt="프로필 사진" />
// //           <UserCol>
// //             <UserName>유저아이디</UserName>
// //           </UserCol>

// //           <BadgeCol>
// //             <img src={badge} alt="뱃지" />
// //           </BadgeCol>
// //         </ProfileRow>

// //         <QuickRow>
// //           <QuickBtn onClick={() => navigate("/routies")}>
// //             <img src={friendIcon} alt="친구" />
// //             <span>Routies</span>
// //           </QuickBtn>
// //           <QuickBtn onClick={() => alert("공유 기능 연결 예정")}>
// //             <img src={shareIcon} alt="공유" />
// //             <span>Share</span>
// //           </QuickBtn>
// //           <QuickBtn onClick={() => navigate("/settings")}>
// //             <img src={settingIcon} alt="설정" />
// //           </QuickBtn>
// //         </QuickRow>

// //         <Tabs>
// //           <Tab
// //             $active={activeTab === "mine"}
// //             onClick={() => setActiveTab("mine")}
// //           >
// //             나의 루트
// //           </Tab>
// //           <Divider />
// //           <Tab
// //             $active={activeTab === "saved"}
// //             onClick={() => setActiveTab("saved")}
// //           >
// //             저장한 루트
// //           </Tab>
// //         </Tabs>

// //         <CardGrid>
// //           {list.map((item) => (
// //             <Card key={item.id}>
// //               <Thumb />
// //               <CardOverlay>
// //                 <Small>{item.keyword}</Small>
// //                 <Title>{item.title}</Title>
// //               </CardOverlay>
// //             </Card>
// //           ))}
// //         </CardGrid>
// //       </Inner>
// //     </Layout>
// //   );
// // }

// // const HeaderRight = styled.div`
// //   position: fixed;
// //   top: calc(env(safe-area-inset-top, 0px));
// //   right: 16px;
// //   height: 58px;
// //   display: flex;
// //   align-items: center;
// //   z-index: 20;
// // `;

// // const LogoutBtn = styled.button`
// //   border: 0;
// //   background: none;
// //   color: var(--Color-pink, #fe5081);
// //   font-weight: 700;
// //   cursor: pointer;
// // `;

// // const Inner = styled.div`
// //   width: 100%;
// //   /* width: min(1024px, 92%); */
// //   margin: 0 auto;
// // `;

// // const ProfileRow = styled.div`
// //   display: grid;
// //   grid-template-columns: 84px 1fr auto;
// //   gap: 16px;
// //   align-items: center;
// //   padding: 14px 0 10px;
// //   background: #fff;
// //   border-bottom: 1px solid #e9e9ed;
// // `;

// // // const Avatar = styled.div`
// // //   width: 84px;
// // //   height: 84px;
// // //   border-radius: 50%;
// // //   background: #bdbdbd;
// // //   position: relative;
// // //   margin-left: 4px;
// // // `;

// // const CamWrap = styled.div`
// //   position: absolute;
// //   right: -6px;
// //   bottom: -6px;
// //   width: 28px;
// //   height: 28px;
// //   border-radius: 999px;
// //   background: #efefef;
// //   border: 2px solid #fff;
// //   display: grid;
// //   place-items: center;
// //   font-size: 14px;
// // `;

// // const UserCol = styled.div`
// //   display: flex;
// //   align-items: center;
// // `;

// // const UserName = styled.h2`
// //   font-size: 22px;
// //   font-weight: 400;
// // `;

// // const BadgeCol = styled.div`
// //   display: flex;
// //   align-items: center;
// //   gap: 10px;
// //   padding-right: 8px;
// // `;

// // const Badge = styled.div`
// //   width: 46px;
// //   height: 34px;
// //   border-radius: 8px;
// //   background: #ff6f9f;
// //   color: #fff;
// //   display: grid;
// //   place-items: center;
// //   font-size: 18px;
// //   box-shadow: 0 2px 0 #e05583 inset;
// // `;

// // const QuickRow = styled.div`
// //   display: grid;
// //   grid-template-columns: repeat(3, 1fr);
// //   gap: 14px;
// //   padding: 14px 6px 18px;
// //   background: #fff;
// // `;

// // const QuickBtn = styled.button`
// //   background: #fff;
// //   border-radius: var(--Radius-M, 8px);
// //   border: 0.5px solid var(--Color-gray, #858282);
// //   display: flex;
// //   align-items: center;
// //   gap: 8px;
// //   justify-content: center;
// //   cursor: pointer;

// //   color: #000;

// //   font-size: 12px;
// //   font-style: normal;
// //   font-weight: 400;
// //   line-height: normal;
// // `;

// // const Icon = styled.span`
// //   display: inline-grid;
// //   place-items: center;
// //   font-size: 18px;
// // `;

// // const Tabs = styled.div`
// //   margin-top: 10px;
// //   display: grid;
// //   grid-template-columns: 1fr 1px 1fr;
// //   align-items: center;
// //   background: var(--Color-bgwht, #f4f4f5);
// // `;

// // const Tab = styled.button`
// //   height: 44px;
// //   border: 0;
// //   background: transparent;
// //   font-weight: 400;
// //   border-bottom: 2px solid ${(p) => (p.$active ? "#222" : "transparent")};
// // `;

// // const Divider = styled.div`
// //   width: 1px;
// //   height: 28px;
// //   background: #dcdce1;
// //   justify-self: center;
// // `;

// // const CardGrid = styled.div`
// //   /* display: flex; */
// //   padding: 18px 19px 34px 19px;
// //   gap: 10px;
// //   flex-direction: column;
// //   align-items: center;
// //   align-self: stretch;
// //   background: var(--Color-bgwht, #f4f4f5);
// //   display: grid;
// //   /* gap: 14px;
// //   padding: 14px 0 24px; */
// //   grid-template-columns: repeat(2, 1fr);
// //   @media (min-width: 420px) {
// //     grid-template-columns: repeat(3, 1fr);
// //   }
// // `;

// // const Card = styled.div`
// //   position: relative;
// //   border-radius: 14px;
// //   overflow: hidden;
// //   background: #c1c1c1;
// //   height: 180px;
// // `;

// // const Thumb = styled.div`
// //   width: 100%;
// //   height: 100%;
// //   background: linear-gradient(180deg, #b4b4b4, #8f8f8f);
// // `;

// // const CardOverlay = styled.div`
// //   position: absolute;
// //   left: 0;
// //   right: 0;
// //   bottom: 0;
// //   padding: 10px 12px;
// //   background: linear-gradient(
// //     180deg,
// //     rgba(0, 0, 0, 0) 0%,
// //     rgba(0, 0, 0, 0.55) 95%
// //   );
// //   color: #fff;
// // `;

// // const Small = styled.div`
// //   font-size: 12px;
// //   opacity: 0.9;
// // `;

// // const Title = styled.div`
// //   margin-top: 2px;
// //   font-weight: 700;
// // `;
