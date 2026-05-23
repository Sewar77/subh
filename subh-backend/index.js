import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoute from "./src/routes/auth.Routes.js";
import userRoutes from "./src/routes/user.Routes.js";
import categoriesRoutes from "./src/routes/categories.Routes.js";
import uploadRoutes from "./src/routes/uploadImage.Routes.js";
import booksRoutes from "./src/routes/books.Routes.js";
import mediaRoutes from "./src/routes/media.Routes.js";
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["PUT", "DELETE", "POST", "CREATE"],
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use("/api", authRoute);
app.use("/api", userRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", uploadRoutes);
app.use("/api", booksRoutes);
app.use("/api", mediaRoutes);
app.listen(port, () => {
  console.log("server runs on port: ", port);
});
