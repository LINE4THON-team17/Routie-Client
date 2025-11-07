import { useNavigate } from "react-router-dom";
import sampleImg from "../../assets/images/sampleCourseImg.png";

export const CourseItemBox = ({ courseId, placeId }) => {
  const navigate = useNavigate();
  console.log({ courseId, placeId });

  return (
    <div
      className="flex gap-[17px] py-[12.5px] px-3 bg-white flex-1 rounded-[8px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] items-center border-[0.5px] border-[var(--color-bg)]"
      onClick={() => navigate(`/course/${courseId}/place/${placeId}`)}
    >
      <img src={sampleImg} alt="" />
      <div className="flex flex-col gap-1">
        <div className="flex gap-[5px] items-center">
          <p
            className={`bg-pink text-white text-[8px] font-light rounded-[16px] px-[6px] py-[2px] `}
          >
            음식점
          </p>
          <h4 className="font-semibold text-4">서브웨이 충무로역</h4>
        </div>
        <p className="typo-small text-[var(--color-shadow)]">
          중구 장충동 12번길-34
        </p>
      </div>
    </div>
  );
};
