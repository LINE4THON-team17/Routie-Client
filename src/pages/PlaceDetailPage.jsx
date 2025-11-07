import { Layout } from "../components/layout/layout";
import samplePlaceImg from "../assets/images/sampleGrayImg.png";
import reviewIcon from "../assets/icons/reviewIcon.svg";
export const PlaceDetailPage = () => {
  return (
    <Layout type="back" text="코스이름">
      <section className="w-full aspect-[375/253] overflow-hidden">
        <img
          src={samplePlaceImg}
          alt="장소이미지"
          className="w-full h-full object-cover"
        />
      </section>
      <section className="w-full  py-4 px-7 border-b-[0.5px] border-[var(--color-bg)]">
        <div className="flex gap-3 items-center">
          <p className="w-[39px] h-[21px] rounded-[16px] bg-[var(--color-green)] text-white justify-center text-[12px] items-center flex font-normal">
            카페
          </p>
          <h4 className="typo-semibold">스타벅스</h4>
        </div>
        <p className="justify-end flex text-[12px] text-[var(--color-shadow)] font-normal">
          중구 장충동 12번길-34
        </p>
      </section>
      <section className="p-[30px] w-full flex flex-col gap-5">
        <div className="flex typo-semibold-s items-center">
          <p>REVIEW</p>
          <img src={reviewIcon} alt="review" />
        </div>
        <div className="break-all typo-regular-s mb-15">
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 ddddd
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말dddddd
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말ddddd
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말dddddd
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말ddddd
          리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말 리뷰의 말dddddd
        </div>
      </section>
    </Layout>
  );
};
