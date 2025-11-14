import { useState } from "react";
import sendIcon from "../../assets/icons/send.svg";
export function ChatBottomBar({ options = [], onSelect, onSend, loading }) {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white pt-2 pb-8 border-t-[0.5px] border-[#D9D9D9] z-[50] px-4 space-y-2">
      {/* 옵션 버튼들 */}
      {options?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onSelect(opt)}
              className="whitespace-nowrap px-3 py-1 rounded-full text-sm bg-[#FFE9E4] text-[var(--color-pink)]"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 + 전송 버튼 */}
      <div className="flex items-center gap-2 text-[var(--color-gray)] bg-[#D9D9D9] rounded-[10px] ">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={
            loading ? "루티가 코스를 짜고 있어요!" : "메시지를 입력하세요..."
          }
          className="flex-1 px-4 py-[10px] outline-none"
          disabled={loading}
        />
        <button onClick={send} className="px-4 py-2 ">
          <img src={sendIcon} alt="전송" />
        </button>
      </div>
    </div>
  );
}
