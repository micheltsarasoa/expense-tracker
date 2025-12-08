"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Collect data from the form fields
    const formData = new FormData(e.target as HTMLFormElement);

    // Convert to a plain object (since JSON.stringify(FormData) doesn't work)
    const formDataObj = Object.fromEntries(formData.entries());

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formDataObj),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "Registration failed");
        return;
      }

      // Registration successful, redirect to login
      toast.success("Account created successfully!");
      router.push("/login?registered=true");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted" data-testid="register-page">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 border border-border">
        <h1 className="text-2xl font-semibold text-center mb-6 text-foreground">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-foreground">Name</label>
            <input
              id="name"
              data-testid="register-name-input"
              type="text"
              name="name"
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              id="email"
              data-testid="register-email-input"
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              id="password"
              data-testid="register-password-input"
              type="password"
              name="password"
              required
              minLength={8}
              className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit-button"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline" data-testid="login-link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}