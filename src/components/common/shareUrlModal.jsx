import { useEffect, useState } from "react";
import closeIcon from "../../assets/icons/closeIcon.svg";

export const ShareUrlModal = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const handleCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[16px] p-6 w-[325px] text-center relative pt-[40px] pb-[46px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-[18.45px] right-[25.44px] text-[#8C8C8C] text-xl font-light"
        >
          <img src={closeIcon} alt="x" />
        </button>
        <h3 className="typo-regular mb-6">URL 공유하기</h3>
        <div className="flex items-center  overflow-hidden gap-[10px] px-[12.5px] ">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 bg-[var(--color-bg)] border border-[#E2E2E2] rounded-[12px] px-4 py-[10px] text-sm text-[#000000] outline-none typo-regular-s text-center w-[215px]"
          />
          <button
            onClick={handleCopy}
            className="w-[41px] bg-[var(--color-yellow)] text-[var(--color-shadow)] p-[10px] typo-regular-s rounded-[8px] mr-1"
          >
            {copied ? "✔️" : "복사"}
          </button>
        </div>
      </div>
    </div>
  );
};
