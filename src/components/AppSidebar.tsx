import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth/AuthProvider";
import { 
  LayoutDashboard, 
  FileText, 
  LogIn, 
  LogOut,
  PlusCircle,
  TestTube2
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  const { session, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-[250px] border-r bg-muted/10">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Sweepstakes Admin
          </h2>
          <div className="space-y-1">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            {session ? (
              <>
                <Link to="/admin">
                  <Button
                    variant={isActive("/admin") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Button>
                </Link>
                <Link to="/admin/sweepstakes/new">
                  <Button
                    variant={isActive("/admin/sweepstakes/new") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Sweepstakes
                  </Button>
                </Link>
                <Link to="/admin/widget-test">
                  <Button
                    variant={isActive("/admin/widget-test") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <TestTube2 className="mr-2 h-4 w-4" />
                    Test Widget
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button
                  variant={isActive("/auth") ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/readme">
              <Button
                variant={isActive("/readme") ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <FileText className="mr-2 h-4 w-4" />
                Documentation
              </Button>
            </Link>
          </div>
        </div>
        <ScrollArea className="px-1">
          <div className="space-y-1 p-2"></div>
        </ScrollArea>
      </div>
    </div>
  );
}