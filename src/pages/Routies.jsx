// src/pages/Routies.jsx
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Layout } from "../components/layout/layout";
import { getMyFriends } from "../api/mypage";
import profileIcon from "../assets/icons/profile.svg";
import badge from "../assets/icons/badge.svg";

export function Routies() {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyFriends().then((r) => r.data);
        const arr = res?.data ?? res ?? [];
        setFriends(arr);
      } catch (e) {
        console.error("[routies] 친구 목록 불러오기 실패", e);
        setFriends([]);
      }
    })();
  }, []);

  return (
    <Layout type="back" text="Routies">
      <ListWrap>
        <HeaderRow>
          <span>총</span>
          <Count>{friends.length}명</Count>
        </HeaderRow>

        {friends.map((f) => (
          <Item key={f.id}>
            <Avatar src={f.profileImageUrl || profileIcon} alt="" />
            <Name>{f.nickname}</Name>
            <Right>
              <img src={badge} alt="badge" />
              <RouteCount>route&nbsp;{f.routeCount ?? "N"}</RouteCount>
            </Right>
          </Item>
        ))}
      </ListWrap>
    </Layout>
  );
}

/* styles */
const ListWrap = styled.div`
  padding: 8px 0 24px;
`;
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  color: #777;
  font-size: 14px;
  border-bottom: 1px solid #eee;
`;
const Count = styled.span`
  color: #999;
`;
const Item = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr auto;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
`;
const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
`;
const Name = styled.div`
  font-size: 16px;
`;
const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
`;
const RouteCount = styled.span`
  font-size: 14px;
`;
