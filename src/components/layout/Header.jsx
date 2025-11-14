import routieLogo from "../../assets/icons/routieLogo.svg";
import backIcon from "../../assets/icons/backIcon.svg";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

export const Header = ({ type, text }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-[58px] border-[#C6C6C6] border-b-[0.5px] top-0 left-0 fixed bg-white">
      {type === "logo" ? (
        <div
          className="w-full px-[14px] py-[15px]"
          onClick={() => navigate(ROUTES.HOME)}
        >
          <img src={routieLogo} alt="routie" />
        </div>
      ) : (
        <div className="relative w-full h-[59px] px-5 py-[16.5px] flex items-center justify-center typo-regular">
          <button
            className="absolute left-5 top-1/2 -translate-y-1/2"
            onClick={() => navigate(-1)}
          >
            <img src={backIcon} alt="<" />
          </button>
          <h4
            className={`text-center w-full ${
              type === "chat" ? "font-titan text-[var(--color-pink)]" : ""
            }`}
          >
            {text}
          </h4>
        </div>
      )}
    </div>
  );
};
