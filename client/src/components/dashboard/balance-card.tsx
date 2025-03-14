import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export function BalanceCard() {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Available Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">
            {parseFloat(user?.balance || "0").toLocaleString("en-US", {
              style: "currency",
              currency: user?.currency || "GYD",
            })}
          </span>
          <span className="text-muted-foreground">{user?.currency}</span>
        </div>
      </CardContent>
    </Card>
  );
}
