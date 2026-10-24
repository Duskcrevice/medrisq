import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardSuite from "./pages/DashboardSuite";
import Operations from "./pages/Operations";
import Portal from "./pages/Portal";
import LoginPage from "./pages/LoginPage";
import RxSafetyPage from "./pages/RxSafetyPage";
import ReportSimplifierPage from "./pages/ReportSimplifierPage";
import OfflineSyncPage from "./pages/OfflineSyncPage";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/login" component={LoginPage} />
    <Route path="/portal" component={DashboardSuite} />
    <Route path="/app/rx-safety" component={RxSafetyPage} />
    <Route path="/app/report-simplifier" component={ReportSimplifierPage} />
    <Route path="/app/offline-sync" component={OfflineSyncPage} />
    <Route path="/app/legacy-operations" component={Operations} />
    <Route path="/app" component={DashboardSuite} />
    <Route path="/app/:rest*" component={DashboardSuite} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>;
}

export default App;
