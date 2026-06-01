import toast from "react-hot-toast";

export const copyToClipboard = async (text, label = "Copied") => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch (err) {
    toast.error("Failed to copy");
  }
};
