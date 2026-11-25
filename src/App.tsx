import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const TransactionsPage = lazy(() => import("@/pages/TransactionsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const ChipsSettingsPage = lazy(() => import("@/pages/ChipsSettingsPage"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-xs font-medium">
      Loading...
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/categories" element={<CategoriesPage />} />
            <Route path="/settings/chips" element={<ChipsSettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster
        position="top-center"
        richColors
        theme="system"
        closeButton
        toastOptions={{
          className: "!bg-card !border-border !text-card-foreground !rounded-2xl !shadow-xl",
        }}
      />
    </ThemeProvider>
  );
}

export default App;
