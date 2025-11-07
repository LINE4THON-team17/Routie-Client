import { CourseBox } from "./CourseBox";

export const HomeCourseSection = () => {
  return (
    <div className="p-4 h-[calc(100%-40px)] overflow-y-auto  pb-60 ">
      <div className="grid grid-cols-2 gap-5 pb-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <CourseBox key={i} />
        ))}
      </div>
    </div>
  );
};
