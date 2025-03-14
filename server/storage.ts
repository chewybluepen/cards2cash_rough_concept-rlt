import { IStorage } from "./types";
import { User, InsertUser, Transaction, InsertTransaction, VirtualCard, InsertVirtualCard } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private virtualCards: Map<number, VirtualCard>;
  public sessionStore: session.Store;
  private currentId: { users: number; transactions: number; virtualCards: number };

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.virtualCards = new Map();
    this.currentId = { users: 1, transactions: 1, virtualCards: 1 };
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      ...insertUser,
      id,
      balance: "0",
      currency: "GYD",
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createVirtualCard(card: InsertVirtualCard): Promise<VirtualCard> {
    const id = this.currentId.virtualCards++;
    const newCard: VirtualCard = {
      ...card,
      id,
      createdAt: new Date()
    };
    this.virtualCards.set(id, newCard);
    return newCard;
  }

  async getUserVirtualCards(userId: number): Promise<VirtualCard[]> {
    return Array.from(this.virtualCards.values())
      .filter(c => c.userId === userId && c.active)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateUserBalance(userId: number, newBalance: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, balance: newBalance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();
