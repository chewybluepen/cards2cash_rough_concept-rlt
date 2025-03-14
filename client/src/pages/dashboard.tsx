import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="p-8 pb-20 lg:pb-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="grid gap-6 md:grid-cols-2">
            <BalanceCard />
            <RecentTransactions />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
