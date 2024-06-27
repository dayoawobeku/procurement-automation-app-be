import express from "express";
import cors from "cors";
import {
  itemsRouter,
  notificationsRouter,
  ordersRouter,
  summaryRouter,
} from "./routes";

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

const corsOptions = {
  origin: "*", // Allow all origins for testing, restrict in production
  credentials: true, // Allow cookies and other credentials
};

app.use(cors(corsOptions));
app.use("/api/orders", ordersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/summary", summaryRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
