import {
  createAuthor,
  createBook,
  findAuthorByName,
  getAllBooks,
  linkBookAuthor,
} from "../models/books.Models.js";
import pool from "../config/db.js";
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
    console.log(req.body);

    // 1. find author
    let author = await findAuthorByName(client, author_name_en, author_name_ar);
    console.log(1);

    // 2. create author if not exists
    if (!author) {
      author = await createAuthor(client, author_name_en, author_name_ar);
    }
    console.log(2);

    // 3. create book
    const book = await createBook(client, {
      name_en,
      name_ar,
      description_en,
      description_ar,
      weight_kg,
      barcode_image,
      category_id,
      price,
      shipping_cost,
      length_cm,
      width_cm,
      height_cm,
    });
    console.log(3);
    // 4. link book + author
    await linkBookAuthor(client, book.id, author.id);
    console.log(4);
    await client.query("COMMIT");
    console.log(5);
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
