import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface AuthFormProps {
  mode: "login" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
  onModeChange: (mode: "login" | "signup") => void;
  error?: string;
}

export function AuthForm({ mode, onSubmit, isLoading, onModeChange, error }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            {error}
          </AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : mode === "login" ? "Sign In" : "Sign Up"}
      </Button>
      <div className="text-center text-sm">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => onModeChange("signup")}
            >
              Sign up
            </Button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => onModeChange("login")}
            >
              Sign in
            </Button>
          </p>
        )}
      </div>
    </form>
  );
}