import { useParams } from "react-router-dom";
import { Layout } from "../components/layout/layout";
import { BottomSheet } from "../components/home/BottomSheet";
import { MapArea } from "../components/home/MapArea";
import { CourseListSection } from "../components/course/CourseListSection";
import { useState } from "react";
import { ShareUrlModal } from "../components/common/shareUrlModal";

export const Course = () => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  return (
    <Layout type="back" text="코스이름">
      <MapArea />
      <BottomSheet>
        <CourseListSection
          onClick={() => setShowModal(true)}
          courseId={Number(id)}
        />
      </BottomSheet>
      {showModal && <ShareUrlModal onClose={() => setShowModal(false)} />}
    </Layout>
  );
};
