import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { Notification, Order } from "../types";

const router = express.Router();

const ordersFilePath = path.resolve(__dirname, "../data/orders.json");
const notificationsFilePath = path.resolve(
  __dirname,
  "../data/notifications.json"
);

const readJsonFile = <T>(filePath: string): T[] => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as T[];
};

router.get("/", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const notifications = readJsonFile<Notification>(notificationsFilePath);

  const totalOrders = orders.length || 0;
  const totalCompletedOrders =
    orders.filter((order) => order.status === "completed").length || 0;
  const totalActiveOrders =
    orders.filter((order) => order.status === "shipped").length || 0;
  const totalNotStartedOrders =
    orders.filter((order) => order.status === "pending").length || 0;

  const totalNotifications = notifications.length;
  const totalUnreadNotifications =
    notifications.filter((notification) => notification.status === "unread")
      .length || 0;

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const uniqueCustomers = new Set(orders.map((order) => order.customerName))
    .size;

  const summary = {
    totalOrders,
    totalCompletedOrders,
    totalActiveOrders,
    totalNotStartedOrders,
    totalRevenue,
    uniqueCustomers,
    totalNotifications,
    totalUnreadNotifications,
  };

  res.json(summary);
});

export default router;
