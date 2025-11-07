import { CourseItemBox } from "./CouseItemBox";
import leftFoot from "../../assets/icons/leftFoot.svg";
import rightFoot from "../../assets/icons/rightFoot.svg";
import saveIcon from "../../assets/icons/saveIcon.svg";
import saveIconWhite from "../../assets/icons/saveIconWhite.svg";
import shareIcon from "../../assets/icons/shareIcon.svg";
import { useState } from "react";

const steps = [0, 0, 0, 0];

export const CourseListSection = ({ onClick }) => {
  const [save, setSave] = useState(false);

  const SAVEICON = save ? saveIconWhite : saveIcon;
  return (
    <div className="px-[23px] pt-2 h-[calc(100%-40px)] overflow-y-auto pb-60">
      <div className=" gap-5 flex flex-col pb-10">
        {steps.map((_, idx) => {
          let isStartOrEnd = idx === 0 || idx === steps.length - 1;
          return (
            <div key={idx} className="gap-5 flex items-center ">
              {!isStartOrEnd ? (
                <div className="w-[30px] h-[30px] bg-[var(--color-yellow)] rounded-full relative z-1 items-center flex justify-center">
                  {idx !== steps.length - 1 ? (
                    <div className="bg-[#858282] absolute w-[1px] left-[50%] h-[61px] top-[32px] " />
                  ) : null}
                  {idx % 2 === 0 ? (
                    <img src={leftFoot} alt="" />
                  ) : (
                    <img src={rightFoot} alt="" />
                  )}
                </div>
              ) : (
                <div className="w-[30px] h-[30px] bg-[#71643C]/70 rounded-full relative z-1 items-center flex justify-center">
                  <div className="w-[20px] h-[20px] bg-[var(--color-yellow)] rounded-full " />
                  {idx !== steps.length - 1 ? (
                    <div className="bg-[#858282] absolute w-[1px] left-[50%] h-[61px] top-[32px] " />
                  ) : null}
                </div>
              )}

              <CourseItemBox />
            </div>
          );
        })}
      </div>
      <div className="pb-[50px] typo-regular-s gap-6 flex justify-center  ">
        <button
          className="flex items-center border-[0.5px] border-[var(--color-gray)] py-[5.5px] px-[30px] rounded-[8px] gap-[7px]"
          onClick={onClick}
        >
          Share
          <img src={shareIcon} alt="share" />
        </button>

        <button
          className={`flex items-center border-[0.5px] border-[var(--color-gray)] py-[5.5px] px-[30px] rounded-[8px] gap-[7px] ${
            save ? "bg-[#444] text-white" : ""
          }`}
          onClick={() => setSave(!save)}
        >
          Save
          <img src={SAVEICON} alt="save" className="text-white" />
        </button>
      </div>
    </div>
  );
};
