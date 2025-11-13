import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { getCategoryColor } from "../../constants/categoryColor";
import { createMarkerSvg } from "../../constants/createMarkerSvg";

export const MapArea = ({ places = [] }) => {
  useKakaoLoader();

  return (
    <div className=" h-[calc(100vh-150px)]">
      <Map
        className="w-full h-full"
        id="map"
        center={
          places.length
            ? { lat: places[0].latitude, lng: places[0].longitude }
            : { lat: 33.450701, lng: 126.570667 }
        }
        level={4}
      >
        {places.map((p, idx) => {
          const color = getCategoryColor(p.category.split("/")[0]);
          const markerUrl = createMarkerSvg(color);
          return (
            <MapMarker
              key={idx}
              position={{ lat: p.latitude, lng: p.longitude }}
              title={p.name}
              image={{
                src: markerUrl,
                size: { width: 25, height: 25 },
                options: { offset: { x: 12, y: 12 } },
              }}
            />
          );
        })}
      </Map>
    </div>
  );
};
