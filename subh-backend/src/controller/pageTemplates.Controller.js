import {
  createPageTemplates,
  deletePageTemplate,
  getAllPageTemplates,
  getPageTemplatesById,
  updatePageTemplates,
} from "../models/pageTemplates.Model.js";

export const createPageTemplatesController = async (req, res) => {
  try {
    const { name, key } = req.body;
    console.log(req.body);

    const page_templates = await createPageTemplates(key, name);
    if (!page_templates) {
      return res
        .status(400)
        .json({ message: "Something went wrong creating new page templates" });
    }
    return res
      .status(201)
      .json({ message: "created done, ", page_templates: page_templates });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong creating new page templates" });
  }
};

export const updatePageTemplatesController = async (req, res) => {
  try {
    const { name, key } = req.body;
    const id = req.params.id;
    const page_templates = await updatePageTemplates(key, name, id);
    if (!page_templates) {
      return res
        .status(400)
        .json({ message: "Something went wrong updating new page templates" });
    }
    return res
      .status(200)
      .json({ message: "updated done, ", page_templates: page_templates });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong creating new page templates" });
  }
};

export const deletePageTemplateController = async (req, res) => {
  try {
    const id = req.params.id;
    const page_templates = await deletePageTemplate(id);
    if (page_templates) {
      return res
        .status(400)
        .json({ message: "Something went wrong deleteing new page templates" });
    }
    return res.status(200).json({ message: "deleted done, " });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong creating new page templates" });
  }
};

export const getAllPageTemplatesController = async (req, res) => {
  try {
    const pages = await getAllPageTemplates();
    if (pages.length === 0) {
      return res.status(200).json({
        message: "There is no pages yet, create new?",
        page_templates: [],
      });
    }
    return res.status(200).json({
      page_templates: pages,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong creating new page templates" });
  }
};

export const getPageTemplatesByIdController = async (req, res) => {
  try {
    const id = req.params.id;
    const page = await getPageTemplatesById(id);
    if (!page) {
      return res.status(404).json({
        message: "not found",
      });
    }
    return res.status(200).json({
      page_templates: page,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong creating new page templates" });
  }
};
