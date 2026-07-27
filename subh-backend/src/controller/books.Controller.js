import pool from "../config/db.js";
import {
  addAuthorToBook,
  createBook,
  deleteBook,
  getAuthorById,
  getAuthorsByIds,
  getBookById,
  getBookByIsbn,
  listAuthorsForBook,
  listBooks,
  linkBookAuthor,
  replaceBookAuthors,
  updateBook,
} from "../models/books.Models.js";
import {
  categoryExists,
  getCategoryById,
} from "../models/categories.Models.js";
import { serializeBook, serializeBookAuthor } from "../utils/bookSerializer.js";
import { serializeCategory } from "../utils/categorySerializer.js";

const isDuplicateISBNError = (error) => error?.code === "23505";
const isForeignKeyViolation = (error) => error?.code === "23503";
const isInvalidSyntaxError = (error) => error?.code === "22P02";

const normalizeBookPayload = (body = {}) => {
  const payload = {};

  const {
    nameEn,
    nameAr,
    descriptionEn,
    descriptionAr,
    weightKg,
    barcodeImage,
    categoryId,
    price,
    shippingCost,
    lengthCm,
    widthCm,
    heightCm,
    coverImage,
    isbn,
    authorIds,
  } = body;

  if (nameEn !== undefined) payload.name_en = String(nameEn).trim();
  if (nameAr !== undefined) payload.name_ar = String(nameAr).trim();
  if (descriptionEn !== undefined)
    payload.description_en = String(descriptionEn).trim();
  if (descriptionAr !== undefined)
    payload.description_ar = String(descriptionAr).trim();
  if (weightKg !== undefined) payload.weight_kg = Number(weightKg);
  if (barcodeImage !== undefined)
    payload.barcode_image = String(barcodeImage).trim();
  if (categoryId !== undefined)
    payload.category_id = categoryId === null ? null : Number(categoryId);
  if (price !== undefined) payload.price = Number(price);
  if (shippingCost !== undefined)
    payload.shipping_cost = shippingCost === null ? null : Number(shippingCost);
  if (lengthCm !== undefined)
    payload.length_cm = lengthCm === null ? null : Number(lengthCm);
  if (widthCm !== undefined)
    payload.width_cm = widthCm === null ? null : Number(widthCm);
  if (heightCm !== undefined)
    payload.height_cm = heightCm === null ? null : Number(heightCm);
  if (coverImage !== undefined) payload.cover_image = String(coverImage).trim();
  if (isbn !== undefined) payload.isbn = String(isbn).trim();
  if (authorIds !== undefined) payload.authorIds = authorIds;

  return payload;
};

export const createBookController = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const payload = normalizeBookPayload(req.body);
    const { authorIds = [] } = req.body;

    if (payload.category_id !== null && payload.category_id !== undefined) {
      const existingCategory = await getCategoryById(payload.category_id);
      if (!existingCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const normalizedIsbn = String(payload.isbn || "").trim();
    if (normalizedIsbn) {
      const existingBook = await getBookByIsbn(normalizedIsbn);
      if (existingBook) {
        return res.status(409).json({ message: "Book ISBN already exists" });
      }
    }

    if (Array.isArray(authorIds) && authorIds.length > 0) {
      const authors = await getAuthorsByIds(authorIds);
      if (authors.length !== new Set(authorIds.map((id) => Number(id))).size) {
        return res
          .status(404)
          .json({ message: "One or more authors were not found" });
      }
    }

    const createdBook = await createBook(client, payload);
    if (!createdBook) {
      return res.status(500).json({ message: "Internal server error" });
    }

    for (const authorId of authorIds) {
      await linkBookAuthor(client, createdBook.id, Number(authorId));
    }

    await client.query("COMMIT");

    const category = payload.category_id
      ? await getCategoryById(payload.category_id)
      : null;
    const authors = await listAuthorsForBook(createdBook.id);
    const serializedBook = serializeBook(createdBook, {
      category: category ? serializeCategory(category) : null,
      authors: authors.map((author) => serializeBookAuthor(author)),
    });

    return res.status(201).json({
      book: serializedBook,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (isDuplicateISBNError(error)) {
      return res.status(409).json({ message: "Book ISBN already exists" });
    }

    if (isForeignKeyViolation(error) || isInvalidSyntaxError(error)) {
      return res.status(400).json({ message: "Invalid book payload" });
    }

    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getAllBooksController = async (req, res) => {
  try {
    const { books, pagination } = await listBooks(req.query);
    const serializedBooks = books.map((book) => serializeBook(book));

    return res.status(200).json({
      books: serializedBooks,
      pagination,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBookController = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookId = Number(req.params.id);
    const existingBook = await getBookById(bookId);
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    await client.query(`DELETE FROM book_authors WHERE book_id = $1`, [bookId]);
    const deletedBook = await deleteBook(bookId);

    await client.query("COMMIT");

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(204).send();
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const getBookByIdController = async (req, res) => {
  try {
    const bookId = Number(req.params.id);
    const book = await getBookById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const category = book.category_id
      ? await getCategoryById(book.category_id)
      : null;
    const authors = await listAuthorsForBook(bookId);

    return res.status(200).json({
      book: serializeBook(book, {
        category: category ? serializeCategory(category) : null,
        authors: authors.map((author) => serializeBookAuthor(author)),
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBookByIdController = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookId = Number(req.params.id);
    const existingBook = await getBookById(bookId);

    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const payload = normalizeBookPayload(req.body);
    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    if (payload.category_id !== undefined && payload.category_id !== null) {
      const category = await getCategoryById(payload.category_id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    if (payload.isbn !== undefined) {
      const bookWithIsbn = await getBookByIsbn(payload.isbn);
      if (bookWithIsbn && bookWithIsbn.id !== bookId) {
        return res.status(409).json({ message: "Book ISBN already exists" });
      }
    }

    if (req.body.authorIds !== undefined) {
      const requestedAuthorIds = Array.isArray(req.body.authorIds)
        ? req.body.authorIds
        : [];
      const authors = await getAuthorsByIds(requestedAuthorIds);
      if (
        authors.length !==
        new Set(requestedAuthorIds.map((id) => Number(id))).size
      ) {
        return res
          .status(404)
          .json({ message: "One or more authors were not found" });
      }
    }

    const updatedBook = await updateBook(bookId, payload);
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (req.body.authorIds !== undefined) {
      await replaceBookAuthors(
        client,
        bookId,
        Array.isArray(req.body.authorIds) ? req.body.authorIds : [],
      );
    }

    await client.query("COMMIT");

    const category = updatedBook.category_id
      ? await getCategoryById(updatedBook.category_id)
      : null;
    const authors = await listAuthorsForBook(bookId);

    return res.status(200).json({
      book: serializeBook(updatedBook, {
        category: category ? serializeCategory(category) : null,
        authors: authors.map((author) => serializeBookAuthor(author)),
      }),
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (isDuplicateISBNError(error)) {
      return res.status(409).json({ message: "Book ISBN already exists" });
    }

    if (isForeignKeyViolation(error) || isInvalidSyntaxError(error)) {
      return res.status(400).json({ message: "Invalid book payload" });
    }

    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
