import routiePrf from "../../assets/icons/rotiePrf.svg";
import routieMePrf from "../../assets/icons/routieMePrf.svg";

export function ChatMessages({ messages }) {
  return (
    <div className="flex flex-col gap-3 p-4 ">
      {messages.map((m, i) => {
        const isUser = m.role === "user";
        const profile = isUser ? routieMePrf : routiePrf;

        return (
          <div
            key={i}
            className={`flex  gap-2  ${
              isUser ? "justify-end" : "justify-start"
            } items-end`}
          >
            {/* 프로필 (루티는 왼쪽, 나는 오른쪽) */}
            {!isUser && (
              <img
                src={profile}
                alt="루티"
                className="w-[34px] h-[34px] rounded-full shrink-0"
              />
            )}

            {/* 말풍선 */}
            <div
              className={`
                max-w-[80%] px-4 py-2
                ${
                  isUser
                    ? "bg-[var(--color-yellow)] self-end  rounded-l-[30px] rounded-tr-[20px]"
                    : "bg-[var(--color-pink)] text-white ] rounded-r-[30px] rounded-tl-[20px]"
                }
              `}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>

            {/* 내 프로필 */}
            {isUser && (
              <img
                src={profile}
                alt="user"
                className="w-[34px] h-[34px] rounded-full shrink-0"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
