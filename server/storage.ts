import { IStorage } from "./types";
import { User, InsertUser, VirtualCard, Transaction } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { nanoid } from "nanoid";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private virtualCards: Map<number, VirtualCard>;
  private transactions: Map<number, Transaction>;
  private currentIds: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.virtualCards = new Map();
    this.transactions = new Map();
    this.currentIds = { users: 1, virtualCards: 1, transactions: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id, balance: "0", currency: "GYD" };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, amount: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = {
      ...user,
      balance: amount,
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createVirtualCard(card: Omit<VirtualCard, "id" | "createdAt">): Promise<VirtualCard> {
    const id = this.currentIds.virtualCards++;
    const virtualCard: VirtualCard = {
      ...card,
      id,
      createdAt: new Date(),
    };
    this.virtualCards.set(id, virtualCard);
    return virtualCard;
  }

  async getVirtualCardsByUser(userId: number): Promise<VirtualCard[]> {
    return Array.from(this.virtualCards.values()).filter(
      (card) => card.userId === userId && card.isActive,
    );
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
