import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import AddFunds from "@/pages/add-funds";
import VirtualCards from "@/pages/virtual-cards";
import Convert from "@/pages/convert";
import Transactions from "@/pages/transactions";
import MonthlyGrowth from "@/pages/monthly-growth";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/add-funds" component={AddFunds} />
      <ProtectedRoute path="/cards" component={VirtualCards} />
      <ProtectedRoute path="/convert" component={Convert} />
      <ProtectedRoute path="/transactions" component={Transactions} />
      <ProtectedRoute path="/monthly-growth" component={MonthlyGrowth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;