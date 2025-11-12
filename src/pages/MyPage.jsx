import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/layout/layout";
import profile from "../assets/icons/profile.svg";
import friendIcon from "../assets/icons/friendIcon.svg";
import shareIcon from "../assets/icons/shareIcon.svg";
import settingIcon from "../assets/icons/settingIcon.svg";
import badge from "../assets/icons/badge.svg";

export function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mine");

  // test 리스트
  const myRoutes = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        id: `mine-${i}`,
        keyword: "# 키워드",
        title: "코스 제목",
      })),
    []
  );
  const savedRoutes = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        id: `saved-${i}`,
        keyword: "# 키워드",
        title: "코스 제목",
      })),
    []
  );

  const list = activeTab === "mine" ? myRoutes : savedRoutes;

  return (
    <Layout type="logo">
      <HeaderRight>
        <LogoutBtn onClick={() => alert("로그아웃 처리 연결 예정")}>
          로그아웃
        </LogoutBtn>
      </HeaderRight>

      <Inner>
        <ProfileRow>
          <img src={profile} alt="프로필 사진" />
          <UserCol>
            <UserName>유저아이디</UserName>
          </UserCol>

          <BadgeCol>
            <img src={badge} alt="뱃지" />
          </BadgeCol>
        </ProfileRow>

        <QuickRow>
          <QuickBtn onClick={() => navigate("/routies")}>
            <img src={friendIcon} alt="친구" />
            <span>Routies</span>
          </QuickBtn>
          <QuickBtn onClick={() => alert("공유 기능 연결 예정")}>
            <img src={shareIcon} alt="공유" />
            <span>Share</span>
          </QuickBtn>
          <QuickBtn onClick={() => navigate("/settings")}>
            <img src={settingIcon} alt="설정" />
          </QuickBtn>
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
          {list.map((item) => (
            <Card key={item.id}>
              <Thumb />
              <CardOverlay>
                <Small>{item.keyword}</Small>
                <Title>{item.title}</Title>
              </CardOverlay>
            </Card>
          ))}
        </CardGrid>
      </Inner>
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
  color: var(--Color-pink, #fe5081);
  font-weight: 700;
  cursor: pointer;
`;

const Inner = styled.div`
  width: 100%;
  /* width: min(1024px, 92%); */
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

// const Avatar = styled.div`
//   width: 84px;
//   height: 84px;
//   border-radius: 50%;
//   background: #bdbdbd;
//   position: relative;
//   margin-left: 4px;
// `;

const CamWrap = styled.div`
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #efefef;
  border: 2px solid #fff;
  display: grid;
  place-items: center;
  font-size: 14px;
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
  gap: 10px;
  padding-right: 8px;
`;

const Badge = styled.div`
  width: 46px;
  height: 34px;
  border-radius: 8px;
  background: #ff6f9f;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 18px;
  box-shadow: 0 2px 0 #e05583 inset;
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
  border-radius: var(--Radius-M, 8px);
  border: 0.5px solid var(--Color-gray, #858282);
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;

  color: #000;

  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const Icon = styled.span`
  display: inline-grid;
  place-items: center;
  font-size: 18px;
`;

const Tabs = styled.div`
  margin-top: 10px;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  align-items: center;
  background: var(--Color-bgwht, #f4f4f5);
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
  /* display: flex; */
  padding: 18px 19px 34px 19px;
  gap: 10px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  background: var(--Color-bgwht, #f4f4f5);
  display: grid;
  /* gap: 14px;
  padding: 14px 0 24px; */
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
