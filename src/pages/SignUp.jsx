import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { requestSignup } from "../api/auth";

export function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isValid = useMemo(() => {
    const okEmail = /\S+@\S+\.\S+/.test(email);
    const okPw = password.length >= 8; // 비밀번호 8자 이상 => 사용자들에게 설명 필요.
    const okId = username.trim().length >= 2;
    return okEmail && okPw && okId;
  }, [email, password, username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await requestSignup({
        email,
        password,
        nickname: username,
      });

      if (res?.status === 201) {
        alert("회원가입 성공! 로그인 페이지로 이동합니다.");
        navigate("/login");
      } else {
        setErrorMsg(
          res?.data?.message || "회원가입 처리 중 오류가 발생했습니다."
        );
      }
    } catch (err) {
      setErrorMsg(err.message || "회원가입에 실패했습니다.");
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
            <Label>
              이메일
              <Input
                placeholder="입력"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Label>
          </Field>
          <Field>
            <Label>
              아이디
              <Input
                placeholder="입력"
                type="text"
                id="user-id"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Label>
          </Field>
          <Field>
            <Label>
              비밀번호
              <Input
                placeholder="입력"
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Label>
          </Field>

          {errorMsg && <ErrorMsg>{errorMsg}</ErrorMsg>}
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
  display: flex;
  flex-direction: column;
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

const ErrorMsg = styled.p`
  color: #e5484d;
  font-size: 14px;
  margin-top: -8px;
`;

const Submit = styled.button`
  height: 56px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  background: #000;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.02s ease;

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
