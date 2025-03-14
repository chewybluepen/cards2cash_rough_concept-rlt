import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function AddFunds() {
  const { toast } = useToast();
  const [prepaidCode, setPrepaidCode] = useState("");

  const topupMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await apiRequest("POST", "/api/transactions", {
        type: "TOPUP",
        amount: amount,
        currency: "GYD",
        status: "COMPLETED",
        details: `Prepaid code: ${prepaidCode}`,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Funds added successfully",
      });
      setPrepaidCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prepaidCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prepaid code",
        variant: "destructive",
      });
      return;
    }
    // Simulating a fixed value for the prepaid code
    topupMutation.mutate("50.00");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-8 pb-20 lg:pb-8">
          <h1 className="text-3xl font-bold mb-8">Add Funds</h1>
          <div className="max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>Enter Prepaid Code</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={prepaidCode}
                    onChange={(e) => setPrepaidCode(e.target.value)}
                    placeholder="Enter your prepaid code"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={topupMutation.isPending}
                  >
                    {topupMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Funds
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
