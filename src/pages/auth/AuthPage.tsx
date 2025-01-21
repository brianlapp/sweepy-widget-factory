import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useAuth();

  useEffect(() => {
    if (session && !isSessionLoading) {
      console.log("Session exists, redirecting to admin"); // Debug log
      navigate("/admin");
    }
  }, [session, isSessionLoading, navigate]);

  const handleAuth = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError("");
      
      if (mode === "login") {
        console.log("Attempting login..."); // Debug log
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error("Sign in error:", signInError); // Debug log
          if (signInError.message === "Invalid login credentials") {
            setError("Invalid email or password. Please try again or sign up if you don't have an account.");
          } else {
            setError(signInError.message);
          }
          return;
        }
        
        toast.success("Successfully signed in!");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) {
          console.error("Sign up error:", signUpError); // Debug log
          setError(signUpError.message);
          return;
        }
        
        toast.success("Please check your email to confirm your account!");
      }
    } catch (error: any) {
      console.error("Auth error:", error); // Debug log
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while session is being checked
  if (isSessionLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Don't show auth page if already authenticated
  if (session) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "login" 
              ? "Enter your credentials to access the admin dashboard"
              : "Enter your details to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm 
            mode={mode} 
            onSubmit={handleAuth}
            isLoading={isLoading}
            onModeChange={setMode}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
}