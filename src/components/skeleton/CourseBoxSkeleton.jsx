export const CourseBoxSkeleton = () => {
  return (
    <div className="w-full h-[197px] rounded-[8px] flex flex-col justify-between overflow-hidden bg-[#e5e5e5] animate-pulse">
      <div className="pt-[10px] px-3">
        <div className="h-4 w-16 bg-[#d1d1d1] "></div>
      </div>

      <div className="bg-[#c4c4c4] py-3 px-[15px]">
        <div className="h-5 w-3/4 bg-[#b3b3b3]"></div>
      </div>
    </div>
  );
};
