import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoute from "./src/routes/auth.Routes.js";
import userRoutes from "./src/routes/user.Routes.js";
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

app.listen(port, () => {
  console.log("server runs on port: ", port);
});
