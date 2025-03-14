import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import type { Transaction } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

type MonthlyData = {
  month: string;
  income: number;
  spending: number;
  balance: number;
};

function processTransactions(transactions: Transaction[]): MonthlyData[] {
  const monthlyMap = new Map<string, { income: number; spending: number }>();

  // Initialize last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    monthlyMap.set(monthKey, { income: 0, spending: 0 });
  }

  transactions.forEach(tx => {
    const date = new Date(tx.createdAt);
    const monthKey = date.toLocaleString('default', { month: 'short' });
    const amount = Number(tx.amount);

    if (monthlyMap.has(monthKey)) {
      const current = monthlyMap.get(monthKey)!;
      if (tx.type === 'PREPAID_LOAD') {
        current.income += amount;
      } else {
        current.spending += amount;
      }
    }
  });

  let runningBalance = 0;
  return Array.from(monthlyMap.entries()).map(([month, data]) => {
    runningBalance += data.income - data.spending;
    return {
      month,
      income: Number(data.income.toFixed(2)),
      spending: Number(data.spending.toFixed(2)),
      balance: Number(runningBalance.toFixed(2)),
    };
  });
}

export default function MonthlyGrowth() {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  if (!user) return null;

  const monthlyData = transactions ? processTransactions(transactions) : [];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-6">Monthly Growth</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" fill="#4ade80" name="Income" />
                      <Bar dataKey="spending" fill="#f87171" name="Spending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Balance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#2563eb"
                        name="Balance"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
