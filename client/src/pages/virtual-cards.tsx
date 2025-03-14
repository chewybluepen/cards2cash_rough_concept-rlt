import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VirtualCard } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";

export default function VirtualCards() {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: cards, isLoading } = useQuery<VirtualCard[]>({
    queryKey: ["/api/virtual-cards"],
  });

  const generateCardMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/virtual-cards", {
        cardNumber: Math.random().toString().slice(2, 18),
        expiryDate: "12/24",
        cvv: Math.random().toString().slice(2, 5),
        amount,
        currency: "USD",
        active: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-cards"] });
      setIsOpen(false);
      setAmount("");
      toast({
        title: "Success",
        description: "Virtual card generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    generateCardMutation.mutate(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-8 pb-20 lg:pb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Virtual Cards</h1>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Virtual Card</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateCardMutation.isPending}
                  >
                    {generateCardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cards?.map((card) => (
                <Card key={card.id}>
                  <CardHeader>
                    <CardTitle>Virtual Card</CardTitle>
                    <CardDescription>
                      {card.active ? "Active" : "Inactive"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <Label>Card Number</Label>
                        <p className="font-mono">
                          {card.cardNumber.match(/.{1,4}/g)?.join(" ")}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <Label>Expiry</Label>
                          <p>{card.expiryDate}</p>
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <p>{card.cvv}</p>
                        </div>
                      </div>
                      <div>
                        <Label>Amount</Label>
                        <p className="font-medium">
                          {parseFloat(card.amount.toString()).toLocaleString(
                            "en-US",
                            {
                              style: "currency",
                              currency: card.currency,
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
