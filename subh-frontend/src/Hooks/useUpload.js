import { useState } from "react";
import { api } from "../../api.js";
import toast from "react-hot-toast";
export const useUpload = () => {
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadedUrl(res.data.url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return {
    uploadImage,
    uploadedUrl,
    loading,
    error,
  };
};
