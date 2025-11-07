import { Layout } from "../components/layout/layout";
import samplePlaceImg from "../assets/images/sampleGrayImg.png";
export const PlaceDetailPage = () => {
  return (
    <Layout>
      <div className="w-full aspect-[375/253] overflow-hidden">
        <img
          src={samplePlaceImg}
          alt="장소이미지"
          className="w-full h-full object-cover"
        />
      </div>
      <div></div>
    </Layout>
  );
};
