import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "@/pages/Index";
import AuthPage from "@/pages/auth/AuthPage";
import ReadmePage from "@/pages/ReadmePage";
import { PreviewPage } from "@/pages/preview/PreviewPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { EditSweepstakesPage } from "@/pages/admin/EditSweepstakesPage";
import { SweepstakesAnalyticsPage } from "@/pages/admin/SweepstakesAnalyticsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1">
                <div className="container">
                  <SidebarTrigger className="my-4" />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/readme" element={<ReadmePage />} />
                    <Route path="/preview/:id" element={<PreviewPage />} />
                    <Route path="/admin/sweepstakes" element={<AdminDashboard />} />
                    <Route path="/admin/sweepstakes/new" element={<EditSweepstakesPage />} />
                    <Route path="/admin/sweepstakes/:id/edit" element={<EditSweepstakesPage />} />
                    <Route path="/admin/sweepstakes/:id/analytics" element={<SweepstakesAnalyticsPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          </SidebarProvider>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;