import { Map, MapMarker, Polyline, useKakaoLoader } from "react-kakao-maps-sdk";
import { getCategoryColor } from "../../constants/categoryColor";
import { createMarkerSvg } from "../../constants/createMarkerSvg";

export const MapArea = ({ places = [], type = "" }) => {
  useKakaoLoader();

  const coursePath =
    type === "course"
      ? places.map((p) => ({
          lat: p.latitude,
          lng: p.longitude,
        }))
      : [];

  return (
    <div className="relative h-[calc(100vh-150px)]">
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
        {type === "course" && coursePath.length >= 2 && (
          <>
            {/* 바깥 라인 */}
            <Polyline
              path={coursePath}
              strokeWeight={15}
              strokeColor="blue"
              strokeOpacity={0.05}
              strokeStyle="solid"
            />

            {/* 안쪽 메인 라인 */}
            <Polyline
              path={coursePath}
              strokeWeight={5}
              strokeColor="white"
              strokeOpacity={1}
              strokeStyle="solid"
            />
          </>
        )}
      </Map>
      {type === "course" && (
        <div className="absolute inset-0 bg-black/10 pointer-events-none z-[5]" />
      )}
    </div>
  );
};
