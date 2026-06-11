"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        rememberMe: rememberMe.toString(),
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else if (res?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("An unexpected authentication error occurred.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">
        
        
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
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Holla, Welcome Back</h1>
            <p className="text-gray-600 mt-2">Hey, welcome back to your special place</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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
                autoComplete="email"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                  disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer select-none">
                  Remember me
                </Label>
              </div>
              <Link href="/forgotpassword" className="text-sm text-pink-600 hover:underline font-medium">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-6 text-base bg-pink-600 hover:bg-pink-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>

        
        <div className="hidden md:block relative w-full h-full bg-gray-50">
          <Image
            src="/1.png"
            alt="MamaCare Mother and Child"
            fill
            className="object-cover"
            priority
          />
          
          <div className="absolute top-10 right-10 z-10">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center justify-center border border-white/20">
              <HeartPulse className="w-8 h-8 text-pink-600 stroke-[1.5]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
