import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import { MyPage } from "./pages/MyPage";
import { Upload } from "./pages/Upload";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Search } from "./pages/Search";
import { Layout } from "./components/layout/layout";
import { Course } from "./pages/Course";
import { SignUp } from "./pages/SignUp";
import Routemake from "./components/newroute/Routemake";
import Placesearch from "./components/newroute/Placesearch";
import Addroute from "./components/newroute/Addroute";
import { PlaceDetailPage } from "./pages/PlaceDetailPage";
import { Routies } from "./pages/Routies";
import Uploading from "./components/newroute/Uploading";
import RoutieAIChatPage from "./pages/RoutieAIChatPage";
import RoutieChatBanner from "./pages/RoutieChatBanner";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.MYPAGE} element={<MyPage />} />
        <Route path={ROUTES.SEARCH} element={<Search />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.UPLOAD} element={<Upload />} />
        <Route path={ROUTES.COURSE} element={<Course />} />
        <Route path={ROUTES.PLACE} element={<PlaceDetailPage />} />
        <Route path={ROUTES.ROUTEMAKE} element={<Routemake />} />
        <Route path="/placesearch" element={<Placesearch />} />
        <Route path={ROUTES.ADDROUTE} element={<Addroute />} />
        <Route path="/uploading" element={<Uploading />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/routies" element={<Routies />} />
        <Route path={ROUTES.ROUTIEAICHAT} element={<RoutieAIChatPage />} />
        <Route
          path={ROUTES.ROUTIEAICHATBANNER}
          element={<RoutieChatBanner />}
        />
        {/* <Route path="/routies" element={<Routies />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
