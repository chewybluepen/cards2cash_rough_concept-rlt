import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Plus, CreditCard, RefreshCw } from "lucide-react";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Add Funds", href: "/add-funds", icon: Plus },
    { name: "Virtual Cards", href: "/virtual-cards", icon: CreditCard },
    { name: "Convert", href: "/convert", icon: RefreshCw },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="grid grid-cols-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button variant="ghost" className="w-full h-16 flex flex-col gap-1">
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
