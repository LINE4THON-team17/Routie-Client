import homeIcon from "../../assets/icons/homeIcon.svg";
import homeIconActive from "../../assets/icons/homeIcon-atv.svg";
import searchIcon from "../../assets/icons/searchIcon.svg";
import searchIconActive from "../../assets/icons/searchIcon-atv.svg";

import myPageIcon from "../../assets/icons/myPageIcon.svg";
import myPageIconActive from "../../assets/icons/myPageIcon-atv.svg";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    paths: ["/", "/course"],
    icon: homeIcon,
    activeIcon: homeIconActive,
    label: "홈",
  },
  {
    paths: ["/search"],
    icon: searchIcon,
    activeIcon: searchIconActive,
    label: "검색",
  },
  {
    paths: ["/mypage"],
    icon: myPageIcon,
    activeIcon: myPageIconActive,
    label: "마이페이지",
  },
];

export const BottomNavBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center pt-3 pb-[41px] border-t-[0.5px] border-[#858282] bg-white z-10">
      {navItems.map(({ paths, icon, activeIcon, label }) => {
        const isActive =
          paths[0] === "/"
            ? pathname === "/" || pathname.startsWith("/course")
            : paths.some((path) => pathname.startsWith(path));
        return (
          <button
            key={label}
            onClick={() => navigate(paths[0])}
            className="flex items-center"
          >
            <img
              src={isActive ? activeIcon : icon}
              alt={label}
              className="w-[30px] h-[30px]"
            />
          </button>
        );
      })}
    </div>
  );
};
