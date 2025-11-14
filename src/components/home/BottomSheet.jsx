import { motion as Motion, useMotionValue, animate } from "framer-motion";
import { CourseBox } from "./CourseBox";

const BAR_HEIGHT = 40; // 핸들바 높이
const OPEN_RATIO = 0.85;
const MID_RATIO = 0.5; // 중간

export const BottomSheet = ({ children }) => {
  const viewport = typeof window !== "undefined" ? window.innerHeight : 800;

  const SHEET_OPEN = Math.round(viewport * OPEN_RATIO);
  const OPEN_Y = 150;
  const MID_Y = Math.round(SHEET_OPEN * (1 - MID_RATIO));
  const CLOSED_Y = SHEET_OPEN - BAR_HEIGHT - 80;

  const y = useMotionValue(CLOSED_Y);

  const snapTo = (target) => {
    animate(y, target, {
      type: "spring",
      stiffness: 400,
      damping: 40,
    });
  };

  const toggle = () => {
    const current = y.get();
    snapTo(current > MID_Y ? OPEN_Y : CLOSED_Y);
  };

  const handleDrag = (_, info) => {
    const newY = Math.min(Math.max(OPEN_Y, y.get() + info.delta.y), CLOSED_Y);
    y.set(newY);
  };

  const handleDragEnd = (_, info) => {
    const projected = y.get() + info.velocity.y * 0.2;
    const points = [OPEN_Y, MID_Y, CLOSED_Y];
    const closest = points.reduce((prev, curr) =>
      Math.abs(curr - projected) < Math.abs(prev - projected) ? curr : prev
    );
    snapTo(closest);
  };

  return (
    <Motion.div
      drag="y"
      dragElastic={0.1}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        y,
        touchAction: "none",
        height: SHEET_OPEN,
      }}
      className="fixed bottom-0 left-0 w-full bg-[var(--color-bgwht)] rounded-t-2xl shadow-2xl z-20 "
    >
      {/* 핸들바 */}
      <div
        className="flex justify-center items-center cursor-pointer bg-[#F4F4F5] border-t-[0.5px] border-[#858282] "
        onClick={toggle}
        style={{
          height: BAR_HEIGHT,
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
        }}
      >
        <div className="w-15 h-[3px] bg-gray-300 rounded-full" />
      </div>

      {children}
    </Motion.div>
  );
};
