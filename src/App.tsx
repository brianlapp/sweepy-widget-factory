import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/components/auth/AuthProvider";

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

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
}

// Layout Component
function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/embed/:id" element={<EmbedPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route index element={<Index />} />
                  <Route path="readme" element={<ReadmePage />} />
                  <Route path="admin">
                    <Route index element={<AdminDashboard />} />
                    <Route path="sweepstakes">
                      <Route path="new" element={<EditSweepstakesPage />} />
                      <Route path=":id/edit" element={<EditSweepstakesPage />} />
                      <Route path=":id/analytics" element={<SweepstakesAnalyticsPage />} />
                    </Route>
                    <Route path="widget-versions" element={<WidgetVersionManager />} />
                  </Route>
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;