import fs from "fs";
import { Notification, Order } from "../../types";
import { notificationsFilePath } from "../constants";

export const readJsonFile = <T>(filePath: string): T[] => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as T[];
};

export const writeJsonFile = <T>(filePath: string, data: T[]): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const createNotification = (message: string): void => {
  const notifications = readJsonFile<Notification>(notificationsFilePath);
  const newNotification: Notification = {
    id: String(Math.floor(100000 + Math.random() * 900000)),
    message,
    status: "unread",
    createdAt: new Date().toISOString(),
  };
  notifications.push(newNotification);
  writeJsonFile(notificationsFilePath, notifications);
};

export const calculateTotalAmount = (order: Order): number => {
  const itemsTotal = order.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  return (
    itemsTotal -
    (order.discount || 0) +
    (order.shippingFee || 0) +
    (order.tax || 0)
  );
};
