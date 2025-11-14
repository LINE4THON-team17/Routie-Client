import { axiosInstance } from "./axiosInstance";

export async function createRoute(payload) {
  try {
    console.log("[createRoute] ▶ POST /routes");
    console.log("📦 payload:", payload);

    const res = await axiosInstance.post("/routes", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
      },
      timeout: 10000, 
    });

    console.log("[createRoute]  response:", res.data);
    return res.data;
  } catch (err) {
    const status = err?.response?.status ?? "N/A";
    const data = err?.response?.data;
    console.error("[createRoute]  error:", status, data);

    if (!err.response) {
      throw new Error("서버에 연결할 수 없습니다. 네트워크 상태를 확인하세요.");
    }

    const msg =
      data?.message ||
      data?.error ||
      data?.msg ||
      (status === 401
        ? "로그인이 만료되었습니다. 다시 로그인해주세요."
        : `HTTP ${status}`);

    throw new Error(msg);
  }
}
