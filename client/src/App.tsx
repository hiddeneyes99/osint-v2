import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import AdminLogin from "@/pages/AdminLogin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import AboutUs from "@/pages/AboutUs";
import ContactUs from "@/pages/ContactUs";
import HistoryPage from "@/pages/History";
import TWHPage from "@/pages/TWH";
import PremiumLogin from "@/pages/PremiumLogin";
import { MatrixBackground } from "@/components/MatrixBackground";
import { BroadcastNotifications } from "@/components/BroadcastNotifications";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/secret" component={AdminLogin} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/premium" component={PremiumLogin} />
      <Route path="/premium-login" component={PremiumLogin} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/about" component={AboutUs} />
      <Route path="/contact" component={ContactUs} />
      <Route path="/twh" component={TWHPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MatrixBackground />
        <Toaster />
        <BroadcastNotifications />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
