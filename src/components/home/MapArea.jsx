import { Map, useKakaoLoader } from "react-kakao-maps-sdk";

export const MapArea = () => {
  useKakaoLoader();

  return (
    <div className="mx-[-112px] h-[calc(100vh-130px)]">
      <Map
        className="w-full h-full"
        id="map"
        center={{ lat: 33.450701, lng: 126.570667 }}
        level={3}
      />
    </div>
  );
};
