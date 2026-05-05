import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/features/billing/schemas";
import { useAuth } from "@/features/auth/store";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Ledgerly" }] }),
  component: AuthPage,
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { login } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[min(420px,100vw)] shadow-[var(--shadow-elegant)]">
          <CardContent className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)]" />
              <div>
                <h1 className="text-xl font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
                <p className="text-sm text-muted-foreground">{mode === "login" ? "Sign in to your workspace" : "Get started in seconds"}</p>
              </div>
            </div>
            {mode === "login"
              ? <LoginForm onDone={(v) => { login({ email: v.email, name: v.email.split("@")[0] }); toast.success("Signed in"); navigate({ to: "/" }); }} />
              : <RegisterForm onDone={(v) => { login({ email: v.email, name: v.name }); toast.success("Account created"); navigate({ to: "/" }); }} />}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "login" ? "No account?" : "Have an account?"}{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: (v: LoginValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  return (
    <form onSubmit={handleSubmit(onDone)} className="space-y-4">
      <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
      <div className="space-y-1.5"><Label>Password</Label><Input type="password" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
      <Button type="submit" className="w-full">Sign in</Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: (v: RegisterValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  return (
    <form onSubmit={handleSubmit(onDone)} className="space-y-4">
      <div className="space-y-1.5"><Label>Name</Label><Input {...register("name")} />{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}</div>
      <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email")} />{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}</div>
      <div className="space-y-1.5"><Label>Password</Label><Input type="password" {...register("password")} />{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}</div>
      <Button type="submit" className="w-full">Create account</Button>
    </form>
  );
}
