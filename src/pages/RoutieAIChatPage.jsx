import { ChatMessages } from "../components/AIChatPage/ChatMessages";
import { Header } from "../components/layout/Header";
import { useLutiEngine } from "../hooks/useLutiEngine";
import dogFoot from "../assets/images/dogDot.png";
import { ChatBottomBar } from "../components/AIChatPage/ChatBottomBar";
import routiePrf from "../assets/icons/rotiePrf.svg";
import { useCreateRoute } from "../api/routes";
import { useNavigate } from "react-router-dom";

export default function RoutieAIChatPage() {
  const { messages, onSelect, onSend, result, loading } = useLutiEngine();
  const { mutate: createRoute } = useCreateRoute();
  const navigate = useNavigate();
  console.log(result);
  const handleSave = () => {
    if (!result) return;

    const payload = {
      title: result.routeTitle,
      target: result.routeTitle,
      keywords: result.routeTitle.split(" "),
      visitedDate: new Date().toISOString().slice(0, 10),
      places: result.places.map((p, idx) => ({
        order: idx + 1,
        name: p.name,
        category: p.category,
        address: p.location || "",
        latitude: p.latitude ?? 0,
        longitude: p.longitude ?? 0,
        photoUrl: p.photoUrl || "",
        review: p.description || "",
      })),
    };
    console.log("Payload:", payload);
    createRoute(payload, {
      onSuccess: (res) => {
        const routeId = res?.data?.routeId;
        if (routeId) {
          navigate(`/course/${routeId}`);
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-[linear-gradient(180deg,var(--color-white)_47.72%,#fe5081_199.38%)] flex-col pt-[60px]">
      <div className="z-100">
        <Header type="chat" text="Chat-ROUTIE" />
      </div>
      <main className="flex-1 overflow-y-auto relative ">
        <img src={dogFoot} alt="" className="fixed z-10 top-[117px]" />
        <div className=" relative z-20 pt-[18px] pb-30 ">
          <ChatMessages messages={messages} />
          {loading && (
            <p className="flex justify-center pb-4 text-gray-500">
              루티가 생각 중이에요...
            </p>
          )}
          {result && (
            <div className="flex px-4 items-end ">
              <img
                src={routiePrf}
                alt="루티"
                className="w-[34px] h-[34px] rounded-full shrink-0 "
              />
              <div className="ml-2 px-4 py-6 space-y-6 bg-[var(--color-pink)] text-white ] rounded-r-[30px] rounded-tl-[20px]">
                <h3 className="text-xl  text-[white] text-center">
                  {result.routeTitle}
                </h3>

                <div className="space-y-4">
                  {result.places?.map((p, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl shadow-md p-4 border border-[#ffdfe8]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-[var(--color-pink)]">
                          {p.order}. {p.name}
                        </span>
                        <span className="text-xs bg-[#FFE3EA] text-[#FF6B8A] px-3 py-1 rounded-full">
                          {p.category}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {p.description}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">{p.location}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-white text-[var(--color-pink)] font-semibold py-3 rounded-xl shadow"
                >
                  코스 저장하기
                </button>
              </div>
            </div>
          )}
        </div>
        <ChatBottomBar
          options={messages[messages.length - 1]?.options}
          onSelect={onSelect}
          onSend={onSend}
          loading={loading}
        />
      </main>
    </div>
  );
}
