import { useEffect, useState } from "react";
import { createContext } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";

export const booksContext = createContext();
export default function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [book, setBook] = useState({});
  const loadBooks = async () => {
    try {
      const res = await api.get("/books");
      setBooks(res.data.books);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <booksContext.Provider
      value={{
        books,
        setBooks,
        loadBooks,
        setBook,
        book,
      }}
    >
      {children}
    </booksContext.Provider>
  );
}
