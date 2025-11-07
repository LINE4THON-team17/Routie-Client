import { BottomSheet } from "../components/home/BottomSheet";
import { FloatingBtn } from "../components/home/FloatingBtn";
import { HomeCourseSection } from "../components/home/HomeCourseSection";
import { MapArea } from "../components/home/MapArea";
import { SeaechBar } from "../components/home/SearchBar";
import { Layout } from "../components/layout/layout";

export const Home = () => {
  return (
    <>
      <Layout type="logo" text="">
        <div className="relative">
          <SeaechBar />
          <MapArea />
          <BottomSheet>
            <HomeCourseSection />
          </BottomSheet>
          <FloatingBtn />
        </div>
      </Layout>
    </>
  );
};
