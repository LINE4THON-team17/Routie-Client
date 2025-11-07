import { CourseItemBox } from "./CouseItemBox";
import leftFoot from "../../assets/icons/leftFoot.svg";
import rightFoot from "../../assets/icons/rightFoot.svg";
const steps = [0, 0, 0, 0];

export const CourseListSection = () => {
  return (
    <div className="px-[23px] pt-2 h-[calc(100%-40px)] overflow-y-auto pb-60">
      <div className=" gap-5 flex flex-col pb-11">
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
    </div>
  );
};
