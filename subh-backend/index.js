import express from "express";
import dotenv from "dotenv";
import authRoute from "./src/routes/auth.Routes.js";
dotenv.config();
const app = express();
const port = process.env.PORT;
app.use(express.json());
app.use("/api", authRoute);

app.listen(port, () => {
  console.log("server runs on port: ", port);
});
