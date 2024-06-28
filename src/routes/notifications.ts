import express, { Request, Response } from "express";
import orderBy from "lodash/orderBy";
import { Notification } from "../../types";
import { readJsonFile, writeJsonFile } from "../helpers";
import { notificationsFilePath } from "../constants";

const router = express.Router();

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
