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
      console.log(bookData);
      const res = await api.post("/book/create", bookData);
      console.log(res);
      const createdBook = res.data.book;
      setBooks((prev) => [createdBook, ...prev]);
      toast.success("Book Created Successfully");
      navigate("/admin/books");
    } catch (error) {
      console.log(error);
      toast.error("Error creating book");
    }
  };

  const deleteBook = async (bookId) => {
    try {
      const res = await api.delete(`/book/${bookId}`);
      loadBooks();
      toast.success("deleted");
    } catch (error) {
      console.log(error);
      toast.error("Error deleteing  book");
    }
  };

  const getBook = async (bookId) => {
    try {
      const res = await api.get(`/book/${bookId}`);
      setBook(res.data.book);
    } catch (error) {
      console.log(error.message);
    }
  };

  return { books, setBooks, createBooks, deleteBook, book, getBook };
};
