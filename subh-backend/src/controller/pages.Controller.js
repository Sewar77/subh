import {
  insertPage,
  getPageById,
  getAllPages,
  getPageByKey,
  deletePageById,
} from "../models/pages.Models.js";

export const insertPageController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ message: "Please inter the key!" });
    }
    const isExisted = await getPageByKey(key);
    if (isExisted) {
      return res.status(400).json({
        message: "page key already existed!",
      });
    }
    const page = await insertPage(key, userId);
    return res.status(201).json({
      message:
        "Created page successfully, you may add section to your page and pblish it",
      page,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "internal sevrer error",
      error,
    });
  }
};

export const getAllPagesController = async (req, res) => {
  try {
    const pages = await getAllPages();
    if (pages.length === 0) {
      return res
        .status(200)
        .json({ message: "There is no pages yet. insert new ", pages: [] });
    }
    return res
      .status(200)
      .json({ message: "Fetshced pages successfully", pages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "internal sevrer error",
      error,
    });
  }
};

export const getPageByIdController = async (req, res) => {
  const id = req.params.id;
  try {
    const page = await getPageById(id);
    if (!page) {
      return res.status(404).json({ message: "page not found!" });
    }
    return res
      .status(200)
      .json({ message: "Fetshced pages successfully", page });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "internal sevrer error",
      error,
    });
  }
};

export const getPageByKeyController = async (req, res) => {
  const key = req.params.key;
  console.log(key);

  try {
    const page = await getPageByKey(key);
    if (!page) {
      return res.status(404).json({ message: "page not found!" });
    }
    return res
      .status(200)
      .json({ message: "Fetshced pages successfully", page });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "internal sevrer error",
      error,
    });
  }
};

export const deletePageByIdController = async (req, res) => {
  const id = req.params.id;
  try {
    const page = await deletePageById(id);
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "internal sevrer error",
      error,
    });
  }
};
