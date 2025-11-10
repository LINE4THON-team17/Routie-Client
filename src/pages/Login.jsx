import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import React, { useState, useMemo } from "react";
import RoutieLogo from "../assets/icons/routieLogo.svg";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okPw = password.length >= 4;
    return okEmail && okPw;
  }, [email, password]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!isValid || loading) return;
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 600));
      navigate("/home");
    } catch (err) {
      alert("로그인에 실패했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <TopSpacer />
      <Logo alt="ROUTIE" src={RoutieLogo} />
      <Title>당신에게 꼭 맞는 코스 추천</Title>

      <Form onSubmit={handleSubmit}>
        <Input
          name="email"
          type="email"
          placeholder="이메일 입력"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          name="password"
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <LoginButton type="submit" disabled={!isValid || loading}>
          {loading ? "처리 중..." : "로그인"}
        </LoginButton>
      </Form>

      <SignupRow>
        <SignupLink
          type="button"
          onClick={() => navigate("/signup")}
          aria-label="회원가입 페이지로 이동"
        >
          회원가입
        </SignupLink>
      </SignupRow>
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TopSpacer = styled.div`
  height: 18vh;
`;

const Logo = styled.img`
  width: 168px;
  height: auto;
  user-select: none;
`;

const Title = styled.h1`
  margin-top: 16px;
  margin-bottom: 40px;
  font-size: 30px;
  font-weight: 700;
  text-align: center;
  line-height: 1.3;
`;

const Form = styled.form`
  width: min(560px, 88%);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Input = styled.input`
  width: 100%;
  height: 56px;
  border: 1.5px solid #e5e5ea;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s ease;

  ::placeholder {
    color: var(--Color-bg, #c6c6c6);
  }

  &:focus {
    border-color: #9e9ea7;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  height: 56px;
  margin-top: 30px;
  border: none;
  border-radius: 12px;
  background: #000;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.02s ease;

  /* &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  } */
`;

const SignupRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
`;

const SignupLink = styled.button`
  color: var(--Color-shadow, #444);
  background: none;
  border: none;
  padding: 0;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
`;
