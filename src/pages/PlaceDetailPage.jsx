import { Layout } from "../components/layout/layout";
import samplePlaceImg from "../assets/images/sampleGrayImg.png";
import reviewIcon from "../assets/icons/reviewIcon.svg";
import { getDetailRoute } from "../api/routes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getCategoryColor } from "../constants/categoryColor";
export const PlaceDetailPage = () => {
  const { courseId, placeId } = useParams();
  const courseIdNum = Number(courseId);
  const placeIdNum = Number(placeId);

  const {
    data: coursedata,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["routeDetail", courseIdNum],
    queryFn: () => getDetailRoute(courseIdNum),
    enabled: !!courseIdNum,
  });

  const placedata = coursedata?.places?.find(
    (place) => place.placeId === placeIdNum
  );
  const category = placedata.category.split("/")[0];

  const photoUrl = placedata.photoUrl?.startsWith(
    "https://routie-4linethon.s3.ap-northeast-2.amazonaws.com/"
  )
    ? placedata.photoUrl
    : samplePlaceImg;

  if (isLoading) return <div>로딩중...</div>;
  if (isError || !placedata) return <div>해당 장소를 찾을 수 없습니다.</div>;

  return (
    <Layout type="back" text={coursedata.title}>
      <section className="w-full aspect-[375/253] overflow-hidden">
        <img
          src={photoUrl}
          alt="장소이미지"
          className="w-full h-full object-cover"
        />
      </section>
      <section className="w-full  py-4 px-7 border-b-[0.5px] border-[var(--color-bg)]">
        <div className="flex gap-3 items-center">
          <p
            className={` h-[21px] rounded-[16px]  text-white justify-center text-[12px] items-center flex font-normal py-[3px] px-[9px] `}
            style={{ backgroundColor: getCategoryColor(category) }}
          >
            {category}
          </p>
          <h4 className="typo-semibold">{placedata.name}</h4>
        </div>
        <p className="justify-end flex text-[12px] text-[var(--color-shadow)] font-normal">
          {placedata.address}
        </p>
      </section>
      <section className="p-[30px] w-full flex flex-col gap-5">
        <div className="flex typo-semibold-s items-center">
          <p>REVIEW</p>
          <img src={reviewIcon} alt="review" />
        </div>
        <div className="break-all typo-regular-s mb-15">{placedata.review}</div>
      </section>
    </Layout>
  );
};
