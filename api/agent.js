export default async function handler(req, res) {
  // CORS 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight 대응
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    /** ------------------------------------------------------
     *  ⚠️ 1) Body 수동 파싱 (Vercel serverless 필수)
     * ------------------------------------------------------ */
    let body = req.body;

    if (!body || Object.keys(body).length === 0) {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      body = JSON.parse(raw);
    }

    const { systemPrompt, userPrompt } = body;

    if (!systemPrompt || !userPrompt) {
      return res
        .status(400)
        .json({ error: "systemPrompt and userPrompt are required" });
    }

    /** ------------------------------------------------------
     * 2) fetchWithRetry (503 재시도)
     * ------------------------------------------------------ */
    async function fetchWithRetry(url, options, retries = 2, delay = 1200) {
      for (let i = 0; i < retries; i++) {
        const r = await fetch(url, options);

        if (r.ok) return r;

        if (r.status === 503) {
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw new Error(`Gemini API Error: ${r.status}`);
      }

      throw new Error("Gemini API overloaded.");
    }

    /** ------------------------------------------------------
     * 3) 모델 설정: 메인 → 오버로드 시 백업
     * ------------------------------------------------------ */
    let model = "gemini-2.5-flash";

    const getApiUrl = (m) =>
      `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: { temperature: 0.7 },
    };

    /** ------------------------------------------------------
     * 4) 메인 모델 호출
     * ------------------------------------------------------ */
    let response = await fetchWithRetry(getApiUrl(model), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    /** ------------------------------------------------------
     * 5) 메인 모델이 과부하일 경우 → lite로 자동 변경
     * ------------------------------------------------------ */
    if (response.status === 503) {
      model = "gemini-2.5-flash-lite";

      response = await fetchWithRetry(getApiUrl(model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    }

    const data = await response.json();

    /** ------------------------------------------------------
     * 6) text 추출 + JSON 코드블럭 추출
     * ------------------------------------------------------ */
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const jsonMatch = text.match(/```json([\s\S]*?)```/);

    let parsed;
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1].trim());
      } catch {
        parsed = { raw: text };
      }
    } else {
      parsed = { raw: text };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Gemini Serverless API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
