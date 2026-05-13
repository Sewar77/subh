import {
  createAuthor,
  createBook,
  deleteBook,
  findAuthorByName,
  getAllBooks,
  getBookById,
  linkBookAuthor,
  updateBookById,
} from "../models/books.Models.js";
import pool from "../config/db.js";
import { getCategoryById } from "../models/categories.Models.js";

export const createBookController = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      cover_image,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
      author_name_en,
      author_name_ar,
    } = req.body;
    console.log("books===:  ", req.body);

    let author = await findAuthorByName(client, author_name_en, author_name_ar);

    if (!author) {
      author = await createAuthor(client, author_name_en, author_name_ar);
    }

    const book = await createBook(client, {
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      cover_image,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
    });

    await linkBookAuthor(client, book.id, author.id);

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Book created successfully",
      book,
      author,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
export const getAllBooksController = async (req, res) => {
  try {
    const books = await getAllBooks();

    return res.status(200).json({
      message: "books fetched",
      books,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBookController = async (req, res) => {
  const bookId = req.params.id;
  try {
    await deleteBook(bookId);
    return res.status(200).json({ message: "deleted" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBookByIdController = async (req, res) => {
  const bookId = req.params.id;
  console.log("bookId", bookId);
  try {
    const book = await getBookById(bookId);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }
    return res.status(200).json({ message: "gets", book: book });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBookByIdController = async (req, res) => {
  const bookId = req.params.id;

  try {
    const {
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      cover_image,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
    } = req.body;

    if (category_id) {
      const categoryCheck = await getCategoryById(category_id);
      if (categoryCheck.rowCount === 0) {
        return res.status(400).json({
          message: "Invalid category_id - category does not exist",
        });
      }
    }
    const updated = await updateBookById(
      {
        name_en,
        name_ar,
        description_en,
        description_ar,
        weight_kg,
        cover_image,
        barcode_image,
        category_id,
        price,
        shipping_cost,
        length_cm,
        width_cm,
        height_cm,
      },
      bookId,
    );

    return res.status(200).json({
      message: "Book updated",
      book: updated,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
