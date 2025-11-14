import { useState } from "react";
import searchIcon from "../../assets/icons/searchIcon.svg";

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(query);
    }
  };

  return (
    <div className="p-4 fixed top-[58px] left-0 w-full z-10 bg-white ">
      <div className="px-[14px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]  bg-[var(--color-bgwht)] rounded-[12px] w-full typo-semibold-s flex items-center gap-3 ">
        <img src={searchIcon} alt="검색" className="w-5 h-5" />
        <input
          className=" py-[10px] rounded-[12px] w-full typo-semibold-s outline-none "
          placeholder="검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
        />
      </div>
    </div>
  );
};
