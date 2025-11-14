import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/layout";
import { BottomSheet } from "../components/home/BottomSheet";
import { MapArea } from "../components/home/MapArea";
import { CourseListSection } from "../components/course/CourseListSection";
import { useState } from "react";
import { ShareUrlModal } from "../components/common/shareUrlModal";
import { useQuery } from "@tanstack/react-query";
import { getDetailRoute } from "../api/routes";

export const Course = () => {
  const { id } = useParams();
  const routeId = Number(id);
  const [showModal, setShowModal] = useState(false);

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["routeDetail", routeId],
    queryFn: () => getDetailRoute(routeId),
    enabled: !!routeId,
  });

  if (isLoading) return <div>로딩중...</div>;
  if (isError) return <div>코스를 불러올 수 없습니다...</div>;

  return (
    <Layout type="back" text={course.title}>
      <MapArea places={course.places} type="course" />
      <BottomSheet>
        <CourseListSection
          onClick={() => setShowModal(true)}
          coursedata={course}
        />
      </BottomSheet>
      {showModal && <ShareUrlModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
};
