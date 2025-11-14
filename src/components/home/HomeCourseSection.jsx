import { useRoutes } from "../../hooks/useRoutes";
import { CourseBoxSkeleton } from "../skeleton/CourseBoxSkeleton";
import { CourseBox } from "./CourseBox";

export const HomeCourseSection = () => {
  const { data, isLoading, isError } = useRoutes();
  if (isError) return <p>루트를 불러올 수 없습니다</p>;
  return (
    <div className="p-4 h-[calc(100%-40px)] overflow-y-auto  pb-60 ">
      <div className="grid grid-cols-2 gap-5 pb-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <CourseBoxSkeleton key={i} />
            ))
          : data.map((route) => (
              <CourseBox key={route.routeId} coursedata={route} />
            ))}
      </div>
    </div>
  );
};
