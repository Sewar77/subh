import { useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useSections = () => {
  const [section, setSection] = useState(null);
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  const createSection = async (pageId, sectionData) => {
    try {
      const res = await api.post(`/create-sections`, {
        pageId: pageId,
        ...sectionData,
      });
      toast.success(res.data?.message || "Section created successfully");
      if (pageId) {
        await fetchSectionsPage(pageId);
      }
      return res.data.section;
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create section",
        );
      }
      throw error;
    }
  };
  const fetchSectionsPage = async (pageId) => {
    try {
      const res = await api.get(`/all-sections/${pageId}`);
      setSections(res.data.sections);
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  const deleteSectionPage = async (sectionId, pageId) => {
    try {
      const res = await api.delete(`/sections/${sectionId}`);
      fetchSectionsPage(pageId);
      toast.success("Deleted section successfully");
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  const updatedSectionPage = async (sectionId, sectionData, pageId) => {
    try {
      const res = await api.put(`/sections/${sectionId}`, sectionData);
      toast.success(res.data?.message || "Section updated successfully");
      if (pageId) {
        await fetchSectionsPage(pageId);
      }
      return res.data.section;
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update section",
        );
      }
      throw error;
    }
  };
  const fetchSectionById = async (sectionId) => {
    try {
      const res = await api.get(`/section/${sectionId}`);
      setSection(res.data.section);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch section");
      }
      throw error;
    }
  };
  return {
    section,
    sections,
    fetchSectionsPage,
    deleteSectionPage,
    updatedSectionPage,
    fetchSectionById,
    createSection,
  };
};
