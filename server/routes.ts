import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema, insertVirtualCardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const transactions = await storage.getUserTransactions(req.user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const transaction = await storage.createTransaction(data);
      
      if (transaction.type === "TOPUP" && transaction.status === "COMPLETED") {
        const newBalance = (parseFloat(req.user.balance) + parseFloat(transaction.amount.toString())).toString();
        await storage.updateUserBalance(req.user.id, newBalance);
      }
      
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  // Virtual Cards
  app.get("/api/virtual-cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const cards = await storage.getUserVirtualCards(req.user.id);
    res.json(cards);
  });

  app.post("/api/virtual-cards", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertVirtualCardSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Check if user has sufficient balance
      if (parseFloat(req.user.balance) < parseFloat(data.amount.toString())) {
        return res.status(400).send("Insufficient balance");
      }
      
      const card = await storage.createVirtualCard(data);
      
      // Deduct amount from user balance
      const newBalance = (parseFloat(req.user.balance) - parseFloat(data.amount.toString())).toString();
      await storage.updateUserBalance(req.user.id, newBalance);
      
      res.json(card);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.errors);
      } else {
        res.status(500).send("Internal server error");
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
