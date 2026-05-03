import { useState } from "react";
import { api } from "../../api.js";
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
      console.log(formData);
      console.log(file);

      const res = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("res", res);

      setUploadedUrl(res.data.url);
    } catch (err) {
      setError("Upload failed");
      console.log(err);
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
