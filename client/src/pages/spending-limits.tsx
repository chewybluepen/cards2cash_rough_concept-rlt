import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const spendingLimitsSchema = z.object({
  dailyLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  transactionLimit: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});

export default function SpendingLimits() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(spendingLimitsSchema),
    defaultValues: {
      dailyLimit: "1000.00",
      transactionLimit: "500.00",
    },
  });

  const updateLimitsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof spendingLimitsSchema>) => {
      const res = await apiRequest("POST", "/api/limits/update", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Spending limits updated successfully",
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

  const onSubmit = (data: z.infer<typeof spendingLimitsSchema>) => {
    updateLimitsMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-6">Spending Limits</h1>

        <Card>
          <CardHeader>
            <CardTitle>Set Transaction Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Limit ({user.currency})</FormLabel>
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
                <FormField
                  control={form.control}
                  name="transactionLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Per Transaction Limit ({user.currency})</FormLabel>
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
                  disabled={updateLimitsMutation.isPending}
                >
                  {updateLimitsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Update Limits
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
