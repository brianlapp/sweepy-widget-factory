import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleAuth = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError("");
      
      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          if (signInError.message === "Invalid login credentials") {
            setError("Invalid email or password. Please try again or sign up if you don't have an account.");
          } else {
            setError(signInError.message);
          }
          return;
        }
        
        toast.success("Successfully signed in!");
        navigate("/admin");
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        
        toast.success("Please check your email to confirm your account!");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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