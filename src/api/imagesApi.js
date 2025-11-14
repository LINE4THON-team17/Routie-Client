import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "./axiosInstance";

const uploadImageFn = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axiosInstance.post("/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImageFn,
  });
};
