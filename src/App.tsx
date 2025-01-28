import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";

// Pages
import Index from "@/pages/Index";
import ReadmePage from "@/pages/ReadmePage";
import AuthPage from "@/pages/auth/AuthPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { EditSweepstakesPage } from "@/pages/admin/EditSweepstakesPage";
import { SweepstakesAnalyticsPage } from "@/pages/admin/SweepstakesAnalyticsPage";
import { PreviewPage } from "@/pages/preview/PreviewPage";
import { EmbedPage } from "@/pages/embed/EmbedPage";
import { WidgetVersionManager } from "@/components/admin/WidgetVersionManager";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen">
          <Routes>
            {/* Embed route without sidebar */}
            <Route path="/embed/:id" element={<EmbedPage />} />
            
            {/* All other routes with sidebar */}
            <Route
              path="*"
              element={
                <div className="flex min-h-screen w-full">
                  <AppSidebar />
                  <main className="flex-1 overflow-y-auto p-8">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/readme" element={<ReadmePage />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/sweepstakes/new" element={<EditSweepstakesPage />} />
                      <Route path="/admin/sweepstakes/:id/edit" element={<EditSweepstakesPage />} />
                      <Route path="/admin/sweepstakes/:id/analytics" element={<SweepstakesAnalyticsPage />} />
                      <Route path="/admin/widget-versions" element={<WidgetVersionManager />} />
                      <Route path="/preview/:id" element={<PreviewPage />} />
                    </Routes>
                  </main>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;