import { Link, useLocation } from "wouter";
import { Home, Wallet, CreditCard, ArrowRightLeft, History, TrendingUp, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";

export function BottomNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/add-funds", icon: Wallet, label: "Add Funds" },
    { href: "/cards", icon: CreditCard, label: "Cards" },
    { href: "/convert", icon: ArrowRightLeft, label: "Convert" },
    { href: "/transactions", icon: History, label: "History" },
    { href: "/monthly-growth", icon: TrendingUp, label: "Growth" },
    { href: "/help", icon: HelpCircle, label: "Help" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 sm:hidden">
      <div className="flex justify-around items-center">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = location === href;
          return (
            <Link key={href} href={href}>
              <a className={`flex flex-col items-center p-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{label}</span>
              </a>
            </Link>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs mt-1">Logout</span>
        </Button>
      </div>
    </nav>
  );
}