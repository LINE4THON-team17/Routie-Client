import { useNavigate } from "react-router-dom";
import sampleImg from "../../assets/images/sampleCourseImg.png";
import { getCategoryColor } from "../../constants/categoryColor";

export const CourseItemBox = ({ courseId, placedata }) => {
  const navigate = useNavigate();
  const category = placedata.category.split("/")[0];
  const photoUrl = placedata.photoUrl?.startsWith(
    "https://routie-4linethon.s3.ap-northeast-2.amazonaws.com/"
  )
    ? placedata.photoUrl
    : sampleImg;

  return (
    <div
      className="flex gap-[17px] py-[12.5px] px-3 bg-white flex-1 rounded-[8px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] items-center border-[0.5px] border-[var(--color-bg)]"
      onClick={() => navigate(`/course/${courseId}/place/${placedata.placeId}`)}
    >
      <img src={photoUrl} alt={placedata.name} className="w-[50px] h-[50px]" />
      <div className="flex flex-col gap-1">
        <div className="flex gap-[5px] items-center">
          <p
            className={`text-white text-[8px] font-light rounded-[16px] px-[6px] py-[2px]  whitespace-nowrap flex-shrink-0 `}
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category}
          </p>
          <h4 className="font-semibold text-4 line-clamp-1">
            {placedata.name.split("(")[0]}
          </h4>
        </div>
        <p className="typo-small text-[var(--color-shadow)]">
          {placedata.address}
        </p>
      </div>
    </div>
  );
};
