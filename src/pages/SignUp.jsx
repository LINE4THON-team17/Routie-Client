import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";

export function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okPw = password.length >= 4;
    const okId = username.trim().length >= 2;
    return okEmail && okPw && okId;
  }, [email, password, username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    try {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 700));
      navigate("/login");
    } catch (err) {
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header type="logo" />
      <Inner>
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>이메일</Label>
            <Input
              placeholder="입력"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field>
            <Label>비밀번호</Label>
            <Input
              placeholder="입력"
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Field>
            <Label>아이디</Label>
            <Input
              placeholder="입력"
              type="text"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>

          <Submit type="submit" disabled={!isValid || loading}>
            {loading ? "처리 중..." : "회원가입"}
          </Submit>
        </Form>

        <BottomRow>
          <span>계정이 이미 있으신가요?</span>
          <LoginLink type="button" onClick={() => navigate("/login")}>
            로그인
          </LoginLink>
        </BottomRow>
      </Inner>
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 120px;
`;

const Inner = styled.div`
  width: min(560px, 92%);
  margin: 12px auto 48px;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  font-size: 15px;
  color: #222;
  font-weight: 400;
`;

const Input = styled.input`
  height: 56px;
  border: 1.5px solid #e5e5ea;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 400;
  outline: none;
  transition: border-color 0.2s ease;

  ::placeholder {
    color: var(--Color-bg, #c6c6c6);
    font-weight: 400;
  }
  &:focus {
    border-color: #9e9ea7;
  }
`;

const Submit = styled.button`
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

  /* &:active {
    transform: translateY(1px);
  } */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BottomRow = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 22px;
  font-size: 15px;
  text-align: center;
`;

const LoginLink = styled.button`
  border: 0;
  background: none;
  padding: 0;
  color: var(--color-blue, #417ff9);
  cursor: pointer;
`;

// export const Upload = () => {
//   return <div>Upload</div>;
// };
