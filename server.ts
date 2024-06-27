import express from "express";
import cors from "cors";
import {
  itemsRouter,
  notificationsRouter,
  ordersRouter,
  summaryRouter,
} from "./routes";

const app = express();
const port = 3003;

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3001", // Update this to the appropriate frontend URL
  credentials: true, // Allow cookies and other credentials
};

app.use(cors(corsOptions));
app.use("/api/orders", ordersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/summary", summaryRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
