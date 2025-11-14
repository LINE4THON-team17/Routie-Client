import { useRef, useState } from "react";
import { BottomSheet } from "../components/home/BottomSheet";
import { FloatingBtn } from "../components/home/FloatingBtn";
import { HomeCourseSection } from "../components/home/HomeCourseSection";
import { MapArea } from "../components/home/MapArea";
import { SearchBar } from "../components/home/SearchBar";
import { Layout } from "../components/layout/layout";
import { axiosInstance } from "../api/axiosInstance";

export const Home = () => {
  const [places, setPlaces] = useState([]);
  const isSearching = useRef(false);

  const handleSearch = async (keyword) => {
    if (isSearching.current) return;
    isSearching.current = true;
    try {
      const res = await axiosInstance.get(`/place/search/places`, {
        params: { keyword },
      });
      console.log(">>", res.data.data);
      setPlaces(res.data.data);
    } catch (e) {
      console.error("검색 오류:", e);
    } finally {
      setTimeout(() => {
        isSearching.current = false;
      }, 100);
    }
  };
  return (
    <>
      <Layout type="logo" text="">
        <div className="relative">
          <SearchBar onSearch={handleSearch} />
          <MapArea places={places} />
          <BottomSheet>
            <HomeCourseSection />
          </BottomSheet>
          <FloatingBtn />
        </div>
      </Layout>
    </>
  );
};
