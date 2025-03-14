import { IStorage } from "./types";
import { User, InsertUser, VirtualCard, Transaction, Notification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { nanoid } from "nanoid";

const MemoryStore = createMemoryStore(session);

// Mock data for initial testing
const mockUser: User = {
  id: 1,
  username: "demo@mail.com",
  password: "password123",
  balance: "1250.00",
  currency: "GYD"
};

const mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    type: "PREPAID_LOAD",
    amount: "500.00",
    currency: "GYD",
    description: "Prepaid code load: GY123456789",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
  },
  {
    id: 2,
    userId: 1,
    type: "CARD_GENERATION",
    amount: "200.00",
    currency: "GYD",
    description: "Virtual card generated: 4532",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
  },
  {
    id: 3,
    userId: 1,
    type: "CONVERSION",
    amount: "100.00",
    currency: "GYD",
    description: "Converted 100.00 GYD to 0.48 USD",
    createdAt: new Date() // Today
  }
];

const mockVirtualCards: VirtualCard[] = [
  {
    id: 1,
    userId: 1,
    cardNumber: "4532123456781234",
    expiryDate: "03/25",
    cvv: "123",
    amount: "200.00",
    currency: "GYD",
    isActive: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: 2,
    userId: 1,
    cardNumber: "4532123456789012",
    expiryDate: "03/25",
    cvv: "456",
    amount: "150.00",
    currency: "GYD",
    isActive: true,
    createdAt: new Date()
  }
];

const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: "TRANSACTION",
    title: "Fund Load Successful",
    message: "Your account has been credited with 500.00 GYD",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: 2,
    userId: 1,
    type: "SECURITY",
    title: "New Virtual Card Created",
    message: "A new virtual card has been generated with amount 200.00 GYD",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
];

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private virtualCards: Map<number, VirtualCard>;
  private transactions: Map<number, Transaction>;
  private notifications: Map<number, Notification>;
  private currentIds: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    // Initialize storage with mock data
    this.users = new Map([[mockUser.id, mockUser]]);
    this.virtualCards = new Map(mockVirtualCards.map(card => [card.id, card]));
    this.transactions = new Map(mockTransactions.map(tx => [tx.id, tx]));
    this.notifications = new Map(mockNotifications.map(notif => [notif.id, notif]));

    this.currentIds = {
      users: Math.max(...this.users.keys()) + 1,
      virtualCards: Math.max(...this.virtualCards.keys()) + 1,
      transactions: Math.max(...this.transactions.keys()) + 1,
      notifications: Math.max(...this.notifications.keys()) + 1
    };

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });
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
      balance: amount
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createVirtualCard(card: Omit<VirtualCard, "id" | "createdAt">): Promise<VirtualCard> {
    const id = this.currentIds.virtualCards++;
    const virtualCard: VirtualCard = {
      ...card,
      id,
      createdAt: new Date()
    };
    this.virtualCards.set(id, virtualCard);
    return virtualCard;
  }

  async getVirtualCardsByUser(userId: number): Promise<VirtualCard[]> {
    return Array.from(this.virtualCards.values())
      .filter((card) => card.userId === userId && card.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error("Notification not found");

    const updatedNotification = {
      ...notification,
      isRead: true
    };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification> {
    const id = this.currentIds.notifications++;
    const newNotification: Notification = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
}

export const storage = new MemStorage();