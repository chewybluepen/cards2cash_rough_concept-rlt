import { Link, useLocation } from "wouter";
import { Home, Wallet, CreditCard, ArrowRightLeft, MoreHorizontal, LogOut, History, TrendingUp, HelpCircle, Building2, Shield, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BottomNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  // Primary navigation items (most frequently used)
  const primaryLinks = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/add-funds", icon: Wallet, label: "Add Funds" },
    { href: "/cards", icon: CreditCard, label: "Cards" },
    { href: "/convert", icon: ArrowRightLeft, label: "Convert" },
  ];

  // Secondary items moved to More menu
  const secondaryLinks = [
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/transactions", icon: History, label: "History" },
    { href: "/monthly-growth", icon: TrendingUp, label: "Growth" },
    { href: "/help", icon: HelpCircle, label: "Help" },
    { href: "/bank-connection", icon: Building2, label: "Bank" },
    { href: "/spending-limits", icon: Shield, label: "Limits" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 sm:hidden">
      <div className="flex justify-around items-center">
        {primaryLinks.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a
                className={`flex flex-col items-center p-2 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{label}</span>
              </a>
            </Link>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center p-2"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {secondaryLinks.map(({ href, icon: Icon, label }) => (
              <DropdownMenuItem key={href} asChild>
                <Link href={href}>
                  <a className="flex items-center">
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </a>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}