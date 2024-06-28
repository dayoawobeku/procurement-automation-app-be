import express, { Request, Response } from "express";
import orderBy from "lodash/orderBy";
import { Order, OrderItem } from "../../types";
import {
  calculateTotalAmount,
  createNotification,
  readJsonFile,
  writeJsonFile,
} from "../helpers";
import { itemsFilePath, ordersFilePath } from "../constants";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const status = req.query.status as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filteredOrders = orders;
  if (status) {
    filteredOrders = orders.filter(
      (order) => order.status.toLowerCase() === status.toLowerCase()
    );
  }

  filteredOrders = orderBy(filteredOrders, ["createdAt"], ["desc"]);

  const resultOrders = filteredOrders.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredOrders.length / limit);

  res.json({
    page,
    limit,
    totalPages,
    totalOrders: filteredOrders.length,
    orders: resultOrders,
  });
});

router.get("/:id", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const order = orders.find((order) => order.id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).send("Order not found");
  }
});

router.post("/", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const existingItems = readJsonFile<OrderItem>(itemsFilePath);

  const newOrder: Order = {
    ...req.body,
    id: String(Math.floor(100000 + Math.random() * 900000)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  newOrder.status = "pending";
  newOrder.paymentStatus = "unpaid";
  newOrder.billingAddress = newOrder.shippingAddress;
  newOrder.trackingNumber = String(
    Math.floor(100000000 + Math.random() * 900000000)
  );
  newOrder.items.forEach((item) => {
    const existingItem = existingItems.find(
      (existingItem) => existingItem.id === item.id
    );
    if (existingItem) {
      item.name = existingItem.name;
      item.price = existingItem.price;
      item.imageUrl = existingItem.imageUrl;
    }
  });
  newOrder.totalAmount = calculateTotalAmount(newOrder);

  orders.push(newOrder);
  writeJsonFile(ordersFilePath, orders);
  createNotification(`Order #${newOrder.id} has been created.`);
  res.status(201).json(newOrder);
});

router.put("/:id", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const existingItems = readJsonFile<OrderItem>(itemsFilePath);

  const index = orders.findIndex((order) => order.id === req.params.id);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    orders[index].items.forEach((item) => {
      const existingItem = existingItems.find(
        (existingItem) => existingItem.id === item.id
      );
      if (existingItem) {
        item.name = existingItem.name;
        item.price = existingItem.price;
        item.imageUrl = existingItem.imageUrl;
      }
    });
    orders[index].totalAmount = calculateTotalAmount(orders[index]);

    writeJsonFile(ordersFilePath, orders);
    createNotification(`Order #${orders[index].id} has been updated.`);
    res.json(orders[index]);
  } else {
    res.status(404).send("Order not found");
  }
});

router.delete("/:id", (req: Request, res: Response) => {
  const orders = readJsonFile<Order>(ordersFilePath);
  const index = orders.findIndex((order) => order.id === req.params.id);
  if (index !== -1) {
    const deletedOrder = orders.splice(index, 1);
    writeJsonFile(ordersFilePath, orders);
    createNotification(`Order #${deletedOrder[0].id} has been deleted.`);
    res.json(deletedOrder);
  } else {
    res.status(404).send("Order not found");
  }
});

export default router;
