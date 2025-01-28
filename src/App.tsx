import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    console.log("[Auth] No session, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Admin Layout Component
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
          {/* Public routes - no auth required */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/embed/:id" element={<EmbedPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          
          {/* Protected admin routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              </ProtectedRoute>
            }
          >
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
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;