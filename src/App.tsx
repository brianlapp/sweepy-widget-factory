import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Standalone routes without sidebar */}
          <Route path="/embed/:id" element={<EmbedPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Routes with sidebar */}
          <Route path="/" element={
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
                <Routes>
                  <Route index element={<Index />} />
                  <Route path="readme" element={<ReadmePage />} />
                  <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="sweepstakes/new" element={<EditSweepstakesPage />} />
                    <Route path="sweepstakes/:id/edit" element={<EditSweepstakesPage />} />
                    <Route path="sweepstakes/:id/analytics" element={<SweepstakesAnalyticsPage />} />
                    <Route path="widget-versions" element={<WidgetVersionManager />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;