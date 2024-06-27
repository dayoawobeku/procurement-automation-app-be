import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";
import orderBy from "lodash/orderBy";
import { Notification } from "../types";

const router = express.Router();

const notificationsFilePath = path.resolve(
  __dirname,
  "../data/notifications.json"
);

const readJsonFile = <T>(filePath: string): T[] => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as T[];
};

const writeJsonFile = <T>(filePath: string, data: T[]): void => {
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

router.get("/", (req: Request, res: Response) => {
  const notifications = readJsonFile<Notification>(notificationsFilePath);
  const status = req.query.status as string;

  let filteredNotifications = notifications;
  if (status) {
    filteredNotifications = notifications.filter(
      (notification) =>
        notification.status.toLowerCase() === status.toLowerCase()
    );
  }

  filteredNotifications = orderBy(
    filteredNotifications,
    ["createdAt"],
    ["desc"]
  );

  res.json(filteredNotifications);
});

router.patch("/:id", (req: Request, res: Response) => {
  const notifications = readJsonFile<Notification>(notificationsFilePath);
  const index = notifications.findIndex(
    (notification) => notification.id === req.params.id
  );
  if (index !== -1) {
    notifications[index].status = req.body.status;
    writeJsonFile(notificationsFilePath, notifications);
    res.json(notifications[index]);
  } else {
    res.status(404).send("Notification not found");
  }
});

export default router;
