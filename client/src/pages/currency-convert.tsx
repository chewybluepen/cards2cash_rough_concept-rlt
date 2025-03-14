import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight } from "lucide-react";
import { fetchExchangeRates, calculateConversion } from "@/lib/currency-api";

export default function CurrencyConvert() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("USD");

  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ["exchange-rates", user?.currency],
    queryFn: () => fetchExchangeRates(user?.currency || "GYD"),
  });

  const convertMutation = useMutation({
    mutationFn: async ({
      amount,
      targetCurrency,
      rate,
    }: {
      amount: string;
      targetCurrency: string;
      rate: number;
    }) => {
      const convertedAmount = calculateConversion(
        parseFloat(amount),
        rate
      ).toString();

      const res = await apiRequest("POST", "/api/transactions", {
        type: "CONVERSION",
        amount,
        currency: user?.currency,
        targetAmount: convertedAmount,
        targetCurrency,
        status: "COMPLETED",
        details: `Converted from ${user?.currency} to ${targetCurrency}`,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Currency converted successfully",
      });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    const rate = rates?.[targetCurrency]?.value;
    if (!rate) {
      toast({
        title: "Error",
        description: "Exchange rate not available",
        variant: "destructive",
      });
      return;
    }

    convertMutation.mutate({ amount, targetCurrency, rate });
  };

  const convertedAmount = amount
    ? calculateConversion(
        parseFloat(amount),
        rates?.[targetCurrency]?.value || 0
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-8 pb-20 lg:pb-8">
          <h1 className="text-3xl font-bold mb-8">Currency Conversion</h1>
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Convert Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleConvert} className="space-y-4">
                  <div>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={`Amount in ${user?.currency}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Select
                        value={targetCurrency}
                        onValueChange={setTargetCurrency}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {rates &&
                            Object.entries(rates).map(([code, rate]) => (
                              <SelectItem key={code} value={code}>
                                {code}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {amount && (
                    <div className="flex items-center gap-2 py-4">
                      <div className="text-lg">
                        {parseFloat(amount).toLocaleString("en-US", {
                          style: "currency",
                          currency: user?.currency,
                        })}
                      </div>
                      <ArrowRight className="h-4 w-4" />
                      <div className="text-lg">
                        {convertedAmount.toLocaleString("en-US", {
                          style: "currency",
                          currency: targetCurrency,
                        })}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      convertMutation.isPending ||
                      ratesLoading ||
                      !amount ||
                      !targetCurrency
                    }
                  >
                    {(convertMutation.isPending || ratesLoading) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Convert
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
