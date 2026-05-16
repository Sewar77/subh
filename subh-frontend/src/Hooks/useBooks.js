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
        toast.error("Something went wrong");
      }
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const res = await api.delete(`/book/${bookId}`);
      loadBooks();
      toast.success("deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const getBook = async (bookId) => {
    try {
      const res = await api.get(`/book/${bookId}`);
      setBook(res.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const updateBook = async (bookId, bookData) => {
    const res = await api.put(`/book/update/${bookId}`, bookData);
    try {
      setBook(res.data.book);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
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
