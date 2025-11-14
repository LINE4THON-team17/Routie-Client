import { useNavigate } from "react-router-dom";

export const CourseBox = ({ coursedata }) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-full h-[197px] rounded-[8px] flex flex-col justify-between overflow-hidden text-white"
      onClick={() => navigate(`/course/${coursedata.routeId}`)}
      style={{
        backgroundImage: coursedata.thumbnailUrl
          ? `url(${coursedata.thumbnailUrl})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#C6C6C6",
      }}
    >
      <h4 className="pt-[10px] px-3 "># {coursedata.keywords[0]}</h4>
      <div className="bg-[#444] py-3 px-[15px] truncate">
        {coursedata.title}
      </div>
    </div>
  );
};
