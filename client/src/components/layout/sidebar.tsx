import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  CreditCard,
  RefreshCw,
  LogOut,
  Home,
  Plus
} from "lucide-react";

export function Sidebar() {
  const { user, logoutMutation } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Add Funds", href: "/add-funds", icon: Plus },
    { name: "Virtual Cards", href: "/virtual-cards", icon: CreditCard },
    { name: "Convert", href: "/convert", icon: RefreshCw },
  ];

  return (
    <Card className="hidden lg:flex h-screen w-64 flex-col fixed left-0 top-0 bottom-0 border-r">
      <div className="flex h-16 items-center gap-2 px-6 border-b">
        <Wallet className="h-6 w-6" />
        <span className="font-semibold">Cards2Cash</span>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              {(isActive) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              )}
            </Link>
          );
        })}
      </div>

      <div className="border-t p-4">
        <div className="mb-4">
          <p className="text-sm font-medium">{user?.fullName}</p>
          <p className="text-sm text-muted-foreground">{user?.username}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </Card>
  );
}
