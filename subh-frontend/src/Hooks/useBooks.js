import { useContext, useEffect } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { booksContext } from "../Context/booksContext";

export const useBooks = () => {
  const { books, setBooks, loadBooks, setBook, book } =
    useContext(booksContext);
  const navigate = useNavigate();
  useEffect(() => {
    loadBooks();
  }, []);
  const createBooks = async (bookData) => {
    try {
      const res = await api.post("/book/create", bookData);
      const createdBook = res.data.book;
      setBooks((prev) => [createdBook, ...prev]);
      navigate("/admin/books");
      toast.success("Book Created Successfully");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.join("\n"));
      } else {
        toast.error("The book could not be created. Check the required book fields and try again.");
      }
    }
  };

  const deleteBook = async (bookId) => {
    try {
      await api.delete(`/book/${bookId}`);
      loadBooks();
      toast.success("Book deleted.");
    } catch (error) {
      throw new Error(error.response?.data?.message || "The book could not be deleted. Check whether it is used elsewhere and try again.", { cause: error });
    }
  };

  const getBook = async (bookId) => {
    try {
      const res = await api.get(`/book/${bookId}`);
      setBook(res.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || "The book details could not be loaded.");
    }
  };

  const updateBook = async (bookId, bookData) => {
    const res = await api.put(`/book/update/${bookId}`, bookData);
    try {
      setBook(res.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || "The book could not be saved. Check the book fields and try again.");
    }
  };

  return {
    books,
    setBooks,
    createBooks,
    deleteBook,
    book,
    getBook,
    updateBook,
  };
};
