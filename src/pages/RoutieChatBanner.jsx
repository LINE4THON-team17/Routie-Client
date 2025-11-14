import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ROUTES } from "../constants/routes";
import dogFoot from "../assets/images/dogDot.png";

import { Layout } from "../components/layout/layout";

const banners = [
  "남자친구와 데이트 코스 추천 ",
  "친구랑 갈만한 곳 추천 ",
  "혼자 힐링 산책 루트 ",
  "엄마랑 데이트 코스 ",
  "전시회 감성 코스 ",
  "따뜻한 카페 루트 ",
  "한강에서 산책 루트 ",
  "맛집 위주 하루 코스 ",
  "비오는 날 감성 코스",
  "서울숲 데이트 루트",
  "성수 카페 탐방 코스",
  "강아지랑 산책 루트",
  "인생사진 건지는 하루 코스",
  "야경 예쁜 데이트 루트",
  "힐링 전시 + 산책 코스",
  "브런치부터 산책까지 루트",
  "반나절 데이트 플랜",
  "감성 가득 성수 루트",
];

export default function RoutieChatBanner() {
  const navigate = useNavigate();

  const goToChat = () => {
    navigate(ROUTES.ROUTIEAICHAT);
  };

  return (
    <div className="w-full flex flex-col bg-[linear-gradient(180deg,var(--color-white)_47.72%,#fe5081_199.38%)] relative">
      <Layout type="chat">
        <img src={dogFoot} alt="" className="fixed z-10 top-[117px]" />
        <div className="flex flex-col flex-grow justify-between pt-6 z-20 h-[calc(100vh-58px-80px)]">
          {/* 타이틀 */}
          <div className="flex flex-col z-20 pl-6 gap[6px]">
            <h2 className="font-titan text-[50px] text-[var(--color-pink)] leading-none">
              ROUTIE
            </h2>
            <p className="typo-regular-s mt-1">
              어디 가고 싶어? AI가 추천 해주는 방문 코스!
            </p>
          </div>

          {/* 하단 컨텐츠 (롤링 배너 + CTA 버튼) */}
          <div className="w-full">
            {/* ⭐ 2줄 무한 롤링 */}
            <div className="overflow-hidden w-full space-y-3 z-20 pb-[30px] text-[#858282] ">
              {/* 1️⃣ 첫 번째 줄 */}
              <Motion.div
                className="flex gap-6 whitespace-nowrap"
                animate={{ x: ["0%", "-80%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 12,
                  ease: "linear",
                }}
              >
                {[...banners, ...banners].reverse().map((text, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-white px-4 py-2 rounded-[12px] shadow-[_0_4px_4px_rgba(0,0,0,0.20)]"
                  >
                    {text}
                  </span>
                ))}
              </Motion.div>

              {/* 2️⃣ 두 번째 줄 */}
              <Motion.div
                className="flex gap-6 whitespace-nowrap"
                animate={{ x: ["0%", "-80%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 12,
                  ease: "linear",
                }}
              >
                {[...banners, ...banners].map((text, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-white px-4 py-2 rounded-[12px] shadow-[_0_4px_4px_rgba(0,0,0,0.15)]"
                  >
                    {text}
                  </span>
                ))}
              </Motion.div>
            </div>
            {/* CTA 버튼 */}
            <div className="mt-auto mb-[48px] px-7 z-20">
              <button
                onClick={goToChat}
                className="w-full bg-[var(--color-pink)] py-[13px] rounded-[8px] text-white shadow-lg"
              >
                ROUTIE와 채팅으로 정하기
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
