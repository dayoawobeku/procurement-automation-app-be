import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const itemsFilePath = path.resolve(__dirname, "../data/items.json");

interface Item {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
}

const readJsonFile = <T>(filePath: string): T[] => {
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as T[];
};

router.get("/", (req: Request, res: Response) => {
  const items = readJsonFile<Item>(itemsFilePath);
  res.json(items);
});

export default router;
