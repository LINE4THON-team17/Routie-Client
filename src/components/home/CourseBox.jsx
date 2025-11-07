import { useNavigate } from "react-router-dom";

export const CourseBox = ({ courseId }) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-full h-[197px] bg-[#C6C6C6] rounded-[8px] flex flex-col justify-between overflow-hidden text-white"
      onClick={() => navigate(`/course/${courseId}`)}
    >
      <h4 className="pt-[10px] px-3 ">#키워드</h4>
      <div className="bg-[#444] py-3 px-[15px]">코스 제목</div>
    </div>
  );
};
