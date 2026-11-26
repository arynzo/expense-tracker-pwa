import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardPage from "@/pages/DashboardPage";
import TransactionsPage from "@/pages/TransactionsPage";
import SettingsPage from "@/pages/SettingsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import ChipsSettingsPage from "@/pages/ChipsSettingsPage";

export function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
          <Route path="/settings/chips" element={<ChipsSettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
