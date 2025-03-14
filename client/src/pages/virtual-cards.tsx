import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, CreditCard } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { VirtualCard } from "@shared/schema";

const generateCardSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  currency: z.string(),
});

export default function VirtualCards() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: cards, isLoading } = useQuery<VirtualCard[]>({
    queryKey: ["/api/cards"],
  });

  const form = useForm({
    resolver: zodResolver(generateCardSchema),
    defaultValues: {
      amount: "",
      currency: user?.currency || "GYD",
    },
  });

  const generateCardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof generateCardSchema>) => {
      const res = await apiRequest("POST", "/api/cards/generate", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Virtual card generated successfully",
      });
      setShowForm(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof generateCardSchema>) => {
    generateCardMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Virtual Cards</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Card
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate New Card</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generateCardMutation.isPending}
                  >
                    {generateCardMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Generate Card
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : cards?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-6">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-center text-muted-foreground">
                No virtual cards yet. Generate your first card to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {cards?.map((card) => (
              <Card key={card.id} className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-90">Virtual Card</p>
                      <p className="font-mono text-lg">
                        **** **** **** {card.cardNumber.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-90">Balance</p>
                      <p className="font-bold">
                        {card.currency} {Number(card.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm opacity-90">
                    <div>
                      <p>Expires</p>
                      <p>{card.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <p>CVV</p>
                      <p>***</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
