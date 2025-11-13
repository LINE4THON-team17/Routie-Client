import { useState, useEffect, useRef } from "react";
import { SYSTEM_PROMPT } from "../lib/buildPrompt";
import { callLutiAgent } from "../api/aiClient";

/* ------------------------------
  질문 단계 (STEPS)
------------------------------ */
const STEPS = [
  {
    key: "region",
    text: "오늘은 어디 근처에서 놀고 싶어? ☀️",
    options: ["성수", "홍대", "한남", "여의도", "강남"],
  },
  {
    key: "partner",
    text: "누구랑 갈 거야? 💞",
    options: ["혼자", "친구랑", "연인이랑", "가족이랑"],
  },
  {
    key: "mood",
    text: "분위기는 어떤 게 좋아? 🌿",
    options: ["조용하게 힐링", "활기차게", "카페 위주", "자연 위주"],
  },
  {
    key: "duration",
    text: "얼마나 놀 거야? ⏰",
    options: ["2시간", "3시간", "4~5시간"],
  },
  {
    key: "theme",
    text: "꼭 포함하고 싶은 테마 있어? ✨",
    options: ["카페", "전시", "산책", "맛집", "없어 괜찮아"],
  },
];

/* ------------------------------
  JSON 코드블럭 추출
------------------------------ */
function extractJsonFromText(text) {
  console.log("[extractJsonFromText] 입력된 전체 text:", text);

  if (!text) {
    console.log("text 없음 → null 반환");
    return null;
  }

  const match = text.match(/```json([\s\S]*?)```/i);

  if (!match) {
    console.log("JSON 코드블럭( ```json ) 발견 못함");
    return null;
  }

  console.log("추출된 JSON Raw:", match[1]);

  try {
    const parsed = JSON.parse(match[1].trim());
    console.log("JSON 파싱 성공:", parsed);
    return parsed;
  } catch (e) {
    console.error("JSON 파싱 오류:", e);
    return null;
  }
}

/* ------------------------------
  Gemini 응답 텍스트 추출
------------------------------ */
function extractResponseText(response) {
  console.log("extractResponseText() 실행 — response:", response);

  try {
    const text =
      response?.fullText ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    console.log("최종 추출된 텍스트:", text);
    return text;
  } catch (e) {
    console.error("extractResponseText 오류:", e);
    return "";
  }
}

/* ============================================================
 useLutiEngine — 최종 수정 버전
============================================================ */
export function useLutiEngine() {
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  /* 초기 질문 */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    console.log(" 초기 랜더링 → 첫 질문 출력");

    addAssistant("안녕! 오늘은 어디 근처에서 놀고 싶어? ☀️");
    addOptions(STEPS[0].options);
  }, []);

  /* ------------------------------
    Helper: Assistant 메시지
  ------------------------------ */
  function addAssistant(text, options) {
    console.log(" Assistant 추가:", text, " | options:", options);
    setMessages((prev) => [...prev, { role: "assistant", text, options }]);
  }

  /* ------------------------------
    Helper: User 메시지
  ------------------------------ */
  function addUser(text) {
    console.log(" User:", text);
    setMessages((prev) => [...prev, { role: "user", text }]);
  }

  /* ------------------------------
    Helper: 옵션 버튼 추가
  ------------------------------ */
  function addOptions(options) {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant") return prev;

      const updated = [...prev];
      updated[updated.length - 1] = { ...last, options };
      return updated;
    });
  }

  /* ------------------------------
    옵션 선택 처리
  ------------------------------ */
  async function onSelect(option, isUserMessage = false) {
    console.log(" onSelect 호출됨 - 선택값:", option);

    //  옵션 버튼을 눌렀을 때만 addUser 실행
    if (!isUserMessage) {
      addUser(option);
    }

    const current = STEPS[step];
    const updatedAnswers = { ...answers, [current.key]: option };
    setAnswers(updatedAnswers);

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep < STEPS.length) {
      const s = STEPS[nextStep];
      addAssistant(s.text, s.options);
      return;
    }

    /* ------------------------------
      Gemini 호출
    ------------------------------ */
    setLoading(true);
    addAssistant("잠깐만~ 루티가 코스 만들어볼게 💫");

    try {
      const userPrompt = `
사용자의 하루 루트 요구사항:
- 지역: ${updatedAnswers.region}
- 동행자: ${updatedAnswers.partner}
- 분위기: ${updatedAnswers.mood}
- 시간: ${updatedAnswers.duration}
- 테마: ${updatedAnswers.theme}
      `;

      const response = await callLutiAgent({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt,
      });

      console.log(" Gemini 응답:", response);

      const fullText = extractResponseText(response);

      const naturalMessage = fullText.replace(/```json[\s\S]*?```/g, "").trim();
      if (naturalMessage) addAssistant(naturalMessage);

      /* JSON 파싱 */
      const json = extractJsonFromText(fullText);
      if (json) setResult(json);
      else addAssistant("앗, 코스를 읽어오는 데 문제가 생겼어 🥲");

      addAssistant("짜봤어! 이 코스 어때? 😆");
    } catch (e) {
      console.error("Gemini API 에러:", e);
      addAssistant("앗... 루트 만드는 중에 문제가 생겼어 🥲");
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------
    Text 입력 전송 기능
  ------------------------------ */
  function onSend(text) {
    console.log(" onSend:", text);
    addUser(text);
    onSelect(text, true);
  }

  /* ------------------------------
    반환
  ------------------------------ */
  return {
    messages,
    onSelect,
    onSend,
    result,
    loading,
  };
}
