import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

// .env 파일 로드
dotenv.config();

const app = express();
app.use(express.json());

console.log(
  "🔧 Loaded GEMINI_API_KEY:",
  process.env.GEMINI_API_KEY ? "✅ Exists" : "❌ Missing"
);

// 503 에러 자동 재시도 로직
async function fetchWithRetry(url, options, retries = 3, delay = 1500) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);

    if (res.ok) return res;

    // 서버 부하로 503 응답일 경우 재시도
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    throw new Error(`Gemini API Error: ${res.status}`);
  }

  throw new Error("Gemini API overloaded. Please try again later.");
}

// 연결 테스트용
app.get("/api/agent", (req, res) => {
  res.json({ status: "ok", message: "Express 연결 성공 ✅" });
});

// Gemini API 프록시
app.post("/api/agent", async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }


    // ✅ 메인 모델 + 백업 모델 설정
    let model = "gemini-2.5-flash";
    const getUrl = (m) =>
      `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
    };

    // 1 메인 모델 호출
    let response = await fetchWithRetry(getUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // 2 메인 모델이 과부하면 lite로 자동 전환
    if (response.status === 503) {
      model = "gemini-2.5-flash-lite";

      response = await fetchWithRetry(getUrl(model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    const data = await response.json();

    // 응답 확인 로그
    console.log(
      JSON.stringify(data).slice(0, 300) + "..."
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Gemini API Error",
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message || "Gemini API call failed" });
  }
});

// 서버 실행
app.listen(3000, () => console.log("🚀 Express API on http://localhost:3000"));
