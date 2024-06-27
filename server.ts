import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  itemsRouter,
  notificationsRouter,
  ordersRouter,
  summaryRouter,
} from "./routes";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

const corsOptions = {
  origin: process.env.APP_URL,
  credentials: true, // Allow cookies and other credentials
};

app.use(cors(corsOptions));
app.use("/api/orders", ordersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/summary", summaryRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
