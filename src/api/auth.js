import { axiosInstance } from "./axiosInstance";

export async function requestSignup({ email, password, nickname }) {
  console.log("[signup] ▶ POST /auth/signup");
  try {
    const res = await axiosInstance.post("/auth/signup", {
      email,
      password,
      nickname,
    });

    return res;
  } catch (err) {
    handleAuthError(err, "signup");
  }
}

export async function requestLogin({ email, password }) {
  console.log("[login] ▶ POST /auth/login");
  try {
    const res = await axiosInstance.post("/auth/login", { email, password });
    const body = res;

    if (body?.status === 200 && body?.data?.accessToken) {
      localStorage.setItem("accessToken", body.data.accessToken);
    }
    return body;
  } catch (err) {
    handleAuthError(err, "login");
  }
}

export async function requestLogout() {
  console.log("[logout] ▶ POST /auth/logout");
  try {
    const res = await axiosInstance.post("/auth/logout");
    localStorage.removeItem("accessToken");
    return res;
  } catch (err) {
    localStorage.removeItem("accessToken");
    handleAuthError(err, "logout");
  }
}

// error 처리
function handleAuthError(err, name) {
  if (err?.response) {
    const { status, data } = err.response;
    console.log(`[${name}] server error`, status, data);

    if (status === 400) throw { status, message: "잘못된 요청(입력 누락 등)" };
    if (status === 401)
      throw { status, message: "이메일 또는 비밀번호가 올바르지 않습니다." };
    if (status === 409)
      throw { status, message: "이미 존재하는 이메일입니다." };

    throw {
      status,
      message: data?.message || "요청 처리 중 오류가 발생했습니다.",
    };
  } else {
    console.log(`[${name}] network error`, err?.message);
    throw { status: 0, message: "네트워크 오류가 발생했습니다." };
  }
}
