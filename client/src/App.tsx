import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import MobileBottomNav from "./components/MobileBottomNav";

const Home = lazy(() => import("./pages/Home"));
const MyPage = lazy(() => import("./pages/MyPage"));
const PlaceDetail = lazy(() => import("./pages/PlaceDetail"));
const Guides = lazy(() => import("./pages/Guides"));
const GuideDetail = lazy(() => import("./pages/Guides").then(module => ({ default: module.GuideDetail })));
const SharedPlan = lazy(() => import("./pages/SharedPlan"));
const Admin = lazy(() => import("./pages/Admin"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<div role="status" className="grid min-h-screen place-items-center bg-[#f7f3ed] text-sm text-[#706156]">온기행의 다음 장면을 준비하는 중입니다.</div>}><Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/places/:id"} component={PlaceDetail} />
      <Route path={"/guides"} component={Guides} />
      <Route path={"/guides/:slug"} component={GuideDetail} />
      <Route path={"/share/:token"} component={SharedPlan} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/me"} component={MyPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch></Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <MobileBottomNav />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
