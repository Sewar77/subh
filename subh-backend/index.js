import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import {
  assertProductionSecurityConfig,
  createCorsOptions,
  requireTrustedMutationOrigin,
} from "./src/config/httpSecurity.js";
import authRoute from "./src/routes/auth.Routes.js";
import userRoutes from "./src/routes/user.Routes.js";
import categoriesRoutes from "./src/routes/categories.Routes.js";
import uploadRoutes from "./src/routes/uploadImage.Routes.js";
import booksRoutes from "./src/routes/books.Routes.js";
import pagesRoutes from "./src/routes/pages.Routes.js";
import sectionRoutes from "./src/routes/section.Routes.js";
import sectionTranlsationRoutes from "./src/routes/sectionTranslation.Routes.js";
import bookRequestRoutes from "./src/routes/bookRequest.Routes.js";
import adminBookRequestRoutes from "./src/routes/adminBookRequest.Routes.js";
import mediaAssetRoutes from "./src/routes/mediaAsset.Routes.js";
import workshopRoutes from "./src/routes/workshop.Routes.js";
import analyticsRoutes from "./src/routes/analytics.Routes.js";
dotenv.config();
assertProductionSecurityConfig();
const app = express();
const port = process.env.PORT || 5000;
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors(createCorsOptions()));

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(requireTrustedMutationOrigin());
app.get("/health", (req, res) => {
res.send("work")
})
app.use("/api", authRoute);
app.use("/api", userRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", uploadRoutes);
app.use("/api", booksRoutes);
app.use("/api", pagesRoutes);
app.use("/api", sectionRoutes);
app.use("/api", sectionTranlsationRoutes);
app.use("/api", bookRequestRoutes);
app.use("/api", adminBookRequestRoutes);
app.use("/api", mediaAssetRoutes);
app.use("/api", workshopRoutes);
app.use("/api", analyticsRoutes);
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ message: "Uploaded file is too large" });
  }
  if (error?.name === "MulterError") {
    return res.status(400).json({ message: "Invalid upload request" });
  }
  if (error?.status && error?.publicMessage) {
    return res.status(error.status).json({ message: error.publicMessage, ...(error.code ? { code: error.code } : {}) });
  }
  if (error?.message === "Origin is not allowed by CORS") {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  return res.status(500).json({ message: "Internal server error" });
});
app.listen(port, () => {
  console.log("server runs on port: ", port);
});
