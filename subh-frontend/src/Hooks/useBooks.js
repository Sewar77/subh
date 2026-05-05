import { useContext } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { booksContext } from "../Context/booksContext";

export const useBooks = () => {
  const { books, setBooks } = useContext(booksContext);
  const navigate = useNavigate();

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

  return { books, setBooks, createBooks };
};
