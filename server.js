import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import socket from "./src/socket.js";
import connectDB from "./src/config/db.js";
import errorHandler from "./src/middlewares/error.js";
import createPublicFolder from "./src/utils/createPublicFolder.js";

//Routes
import routes from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// connect to database
connectDB();

// create public folder
createPublicFolder();

const app = express();

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

app.set("trust proxy", "127.0.0.1");

// Prevent http param pollution
app.use(hpp());

const whitelist = [
  "http://localhost:3000",
  "http://localhost:6062",
  "https://volley.aliareef.com",
];

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// corse middleware
app.use(cors(corsOptions));

// body parser
app.use(express.json());

app.use(
  "/images/uploads",
  express.static(path.join(__dirname, "public", "images")),
);

// dev logging middleware
// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1", routes);

// use custom error handler
app.use(errorHandler);

const PORT = process.env.PORT || 6035;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
socket.initSocket(server);

// Start HTTP + Socket.IO server
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`error: ${err.message}`);
});
