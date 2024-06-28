import request from "supertest";
import express from "express";
import fs from "fs";
import { calculateTotalAmount } from "../../helpers";
import { ordersFilePath } from "../../constants";
import { Order } from "../../../types";
import { ordersRouter } from "../../routes";
import { orderSchema } from "../../schema";

const mockOrders: Order[] = [
  {
    id: "1",
    customerName: "John Doe",
    shippingAddress: "123 Main St",
    items: [
      { id: "1", quantity: 2, price: 5, name: "Item 1", imageUrl: "item1.jpg" },
      {
        id: "2",
        quantity: 1,
        price: 10,
        name: "Item 2",
        imageUrl:
          "https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SX679_.jpg",
      },
    ],
    shippingFee: 10,
    discount: 5,
    tax: 2,
    createdAt: "",
    updatedAt: "",
    billingAddress: "",
    status: "completed",
    totalAmount: 0,
    paymentStatus: "Paid",
    shippingMethod: "Standard Shipping",
    trackingNumber: "123459876",
    estimatedDelivery: "2024-07-06T00:00:00.000Z",
  },
  {
    id: "2",
    customerName: "Jane Doe",
    shippingAddress: "456 Elm St",
    items: [
      {
        id: "3",
        quantity: 1,
        price: 15,
        name: "",
        imageUrl: "",
      },
      {
        id: "4",
        quantity: 3,
        price: 8,
        name: "",
        imageUrl: "",
      },
    ],
    shippingFee: 15,
    discount: 0,
    tax: 3,
    createdAt: "",
    updatedAt: "",
    billingAddress: "",
    status: "completed",
    totalAmount: 0,
    paymentStatus: "",
    shippingMethod: "",
    trackingNumber: "",
    estimatedDelivery: "",
  },
];

const app = express();
app.use(express.json());
app.use("/api/orders", ordersRouter);

jest.mock("fs", () => {
  // in-memory data store
  let orders: Order[] = [];

  return {
    readFileSync: jest.fn((path: string) => JSON.stringify(orders)),
    writeFileSync: jest.fn((path: string, data: string) => {
      orders = JSON.parse(data);
    }),
    __setOrders: (newOrders: Order[]) => {
      orders = newOrders;
    },
  };
});

const { __setOrders } = fs as any;

beforeEach(() => {
  // reset in-memory data before each test
  __setOrders([]);
});

describe("API Integration Tests", () => {
  it("POST /api/orders should create a new order", async () => {
    const newOrder: Omit<
      Order,
      "id" | "createdAt" | "updatedAt" | "billingAddress" | "totalAmount"
    > = {
      customerName: "John Doe",
      shippingAddress: "123 Main St",
      items: [
        {
          id: "1",
          quantity: 2,
          price: 5,
          name: "Item 1",
          imageUrl: "item1.jpg",
        },
        {
          id: "2",
          quantity: 1,
          price: 10,
          name: "Item 2",
          imageUrl: "item2.jpg",
        },
      ],
      shippingFee: 10,
      discount: 5,
      tax: 2,
      status: "completed",
      paymentStatus: "Paid",
      shippingMethod: "Standard Shipping",
      trackingNumber: "123456789",
      estimatedDelivery: "2024-06-25T00:00:00Z",
    };

    const { error } = orderSchema.validate(newOrder);
    if (error) {
      throw new Error(
        `Validation error: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    const response = await request(app)
      .post("/api/orders")
      .send(newOrder)
      .expect(201);

    expect(response.body).toHaveProperty("id");
    expect(response.body.customerName).toBe(newOrder.customerName);
    expect(response.body.shippingAddress).toBe(newOrder.shippingAddress);
    expect(response.body.items).toHaveLength(newOrder.items.length);

    const orders = JSON.parse(
      fs.readFileSync(ordersFilePath, "utf8")
    ) as Order[];
    const createdOrder = orders.find(
      (order) => order.customerName === newOrder.customerName
    );

    expect(createdOrder).toBeTruthy();
    expect(createdOrder?.customerName).toBe(newOrder.customerName);
    expect(createdOrder?.totalAmount).toBe(
      createdOrder ? calculateTotalAmount(createdOrder) : 0
    );
  });

  it("GET /api/orders should retrieve all orders", async () => {
    __setOrders(mockOrders);

    const response = await request(app).get("/api/orders").expect(200);

    expect(response.body.orders).toHaveLength(2);
    expect(response.body.orders[0].customerName).toBe(
      mockOrders[0].customerName
    );
  });

  it("GET /api/orders/:id should retrieve a single order", async () => {
    __setOrders(mockOrders);

    const response = await request(app)
      .get(`/api/orders/${mockOrders[0].id}`)
      .expect(200);

    expect(response.body.customerName).toBe(mockOrders[0].customerName);
  });

  it("PUT /api/orders/:id should update an existing order", async () => {
    __setOrders(mockOrders);

    const updatedOrder = {
      customerName: "Jane Doe",
      shippingAddress: "456 Elm St",
      items: [
        {
          id: "3",
          quantity: 1,
          price: 15,
          name: "Item 3",
          imageUrl: "item3.jpg",
        },
        {
          id: "4",
          quantity: 3,
          price: 8,
          name: "Item 4",
          imageUrl: "item4.jpg",
        },
      ],
      shippingFee: 15,
      discount: 0,
      tax: 3,
      status: "completed",
      paymentStatus: "Paid",
      shippingMethod: "Standard Shipping",
      trackingNumber: "123456789",
      estimatedDelivery: "2024-06-25T00:00:00Z",
    };

    const { error } = orderSchema.validate(updatedOrder);
    if (error) {
      throw new Error(
        `Validation error: ${error.details.map((d) => d.message).join(", ")}`
      );
    }

    const response = await request(app)
      .put(`/api/orders/${mockOrders[0].id}`)
      .send(updatedOrder)
      .expect(200);

    expect(response.body.customerName).toBe(updatedOrder.customerName);
    expect(response.body.id).toBe(mockOrders[0].id);

    const orders = JSON.parse(
      fs.readFileSync(ordersFilePath, "utf8")
    ) as Order[];
    const existingOrder = orders.find((order) => order.id === mockOrders[0].id);

    expect(existingOrder?.customerName).toBe(updatedOrder.customerName);
  });

  it("DELETE /api/orders/:id should delete an existing order", async () => {
    __setOrders(mockOrders);

    const response = await request(app)
      .delete(`/api/orders/${mockOrders[0].id}`)
      .expect(200);

    expect(response.body).toHaveLength(1);

    const orders = JSON.parse(
      fs.readFileSync(ordersFilePath, "utf8")
    ) as Order[];
    const existingOrder = orders.find((order) => order.id === mockOrders[0].id);

    expect(existingOrder).toBeFalsy();
  });
});
