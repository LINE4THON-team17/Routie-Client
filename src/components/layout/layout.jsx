import { Header } from "./Header";
import { BottomNavBar } from "./BottomNavBar";

export const Layout = ({ type = "logo", text = "", children }) => {
  return (
    <div className="relative min-h-screen flex flex-col ">
      <Header type={type} text={text} />
      <main className="flex-1 overflow-y-auto pt-[58px] pb-[80px]">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};
