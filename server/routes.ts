import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTransactionSchema, insertVirtualCardSchema } from "@shared/schema";
import { z } from "zod";

const prepaidCodeSchema = z.object({
  code: z.string().min(10).max(20),
  amount: z.string(),
});

const conversionSchema = z.object({
  amount: z.string(),
  fromCurrency: z.string(),
  toCurrency: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Add funds with prepaid code
  app.post("/api/funds/add", requireAuth, async (req, res) => {
    try {
      const { code, amount } = prepaidCodeSchema.parse(req.body);
      const user = await storage.getUser(req.user!.id);
      if (!user) throw new Error("User not found");

      const newBalance = (Number(user.balance) + Number(amount)).toString();
      const updatedUser = await storage.updateUserBalance(user.id, newBalance);

      const transaction = await storage.createTransaction({
        userId: user.id,
        type: "PREPAID_LOAD",
        amount,
        currency: user.currency,
        description: `Prepaid code load: ${code}`,
      });

      res.json({ user: updatedUser, transaction });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  // Generate virtual card
  app.post("/api/cards/generate", requireAuth, async (req, res) => {
    try {
      const cardData = insertVirtualCardSchema.parse({
        ...req.body,
        userId: req.user!.id,
        cardNumber: `4532${Math.random().toString().slice(2, 14)}`,
        expiryDate: new Date(Date.now() + 31536000000).toISOString().slice(2, 7),
        cvv: Math.random().toString().slice(2, 5),
      });

      const virtualCard = await storage.createVirtualCard(cardData);
      
      await storage.createTransaction({
        userId: req.user!.id,
        type: "CARD_GENERATION",
        amount: cardData.amount,
        currency: cardData.currency,
        description: `Virtual card generated: ${virtualCard.cardNumber.slice(-4)}`,
      });

      res.json(virtualCard);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid request" });
    }
  });

  // Get user's virtual cards
  app.get("/api/cards", requireAuth, async (req, res) => {
    try {
      const cards = await storage.getVirtualCardsByUser(req.user!.id);
      res.json(cards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  // Get user's transactions
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUser(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Convert currency
  app.post("/api/convert", requireAuth, async (req, res) => {
    try {
      const { amount, fromCurrency, toCurrency } = conversionSchema.parse(req.body);
      
      // Call CurrencyAPI for live rates
      const response = await fetch(
        `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}&base_currency=${fromCurrency}&currencies=${toCurrency}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data = await response.json();
      const rate = data.data[toCurrency].value;
      const convertedAmount = (Number(amount) * rate).toFixed(2);

      const transaction = await storage.createTransaction({
        userId: req.user!.id,
        type: "CONVERSION",
        amount,
        currency: fromCurrency,
        description: `Converted ${amount} ${fromCurrency} to ${convertedAmount} ${toCurrency}`,
      });

      res.json({ 
        convertedAmount,
        rate,
        transaction,
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Conversion failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
