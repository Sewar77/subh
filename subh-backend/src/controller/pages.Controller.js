import {
  createPage,
  deletePage,
  getAllPages,
  getPageBySlug,
  updatePage,
} from "../models/pages.Models.js";

export const createPageController = async (req, res) => {
  try {
    const page = await createPage(req.body);
    return res.status(201).json(page);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllPagesController = async (req, res) => {
  try {
    const pages = await getAllPages();
    return res.json(pages);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getPageBySlugController = async (req, res) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updatePageController = async (req, res) => {
  try {
    const page = await updatePage(req.params.id, req.body);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deletePageController = async (req, res) => {
  try {
    const page = await deletePage(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
