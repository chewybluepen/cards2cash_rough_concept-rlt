import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2 } from "lucide-react";
import { BottomNav } from "@/components/ui/bottom-nav";
import { useToast } from "@/hooks/use-toast";

const bankConnectionSchema = z.object({
  accountNumber: z.string().min(8, "Account number must be at least 8 characters"),
  routingNumber: z.string().min(9, "Routing number must be 9 digits").max(9),
  accountHolderName: z.string().min(2, "Please enter the account holder name"),
  bankName: z.string().min(2, "Please enter the bank name"),
});

export default function BankConnection() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm({
    resolver: zodResolver(bankConnectionSchema),
    defaultValues: {
      accountNumber: "",
      routingNumber: "",
      accountHolderName: "",
      bankName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof bankConnectionSchema>) => {
    setIsVerifying(true);
    try {
      // Simulate bank verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Bank Account Connected",
        description: "Your bank account has been successfully linked.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect bank account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-6">Connect Bank Account</h1>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter bank name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter account holder name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Enter account number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Enter routing number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Connect Bank Account
                    </>
                  )}
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
