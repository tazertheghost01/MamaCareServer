"use client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        
       
        <div className="hidden md:block relative w-full h-full bg-gray-50">
          <Image
            src="/1.png"
            alt="MamaCare Mother and Child"
            fill
            className="object-cover"
            priority
          />
        </div>

        
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <Image
              src="/logo.png"
              alt="MamaCare Logo"
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-600 mt-2">
                  No worries! Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 text-base bg-pink-600 hover:bg-pink-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Link..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center mt-8">
                <Link
                  href="/login"
                  className="text-pink-600 font-medium hover:underline flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Mail className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Check Your Email</h2>
              <p className="text-gray-600 mt-3">
                We&apos;ve sent a password reset link to<br />
                <strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                className="mt-8"
                onClick={() => setIsSubmitted(false)}
              >
                Send Again
              </Button>
              <div className="mt-6">
                <Link href="/login" className="text-pink-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
