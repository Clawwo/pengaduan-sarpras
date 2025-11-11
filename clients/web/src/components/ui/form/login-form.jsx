import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({ className, isLoading = false, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className={cn("flex flex-col gap-6 text-neutral-100", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-semibold text-white">Masuk ke akun</h1>
        <p className="text-sm text-neutral-400">
          Masukkan username dan kata sandi untuk melanjutkan.
        </p>
      </div>
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="username" className="text-neutral-300">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Masukkan Username"
            autoComplete="off"
            required
            className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5 focus-visible:ring-offset-0/0"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password" className="text-neutral-300">
            Kata sandi
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan Kata Sandi"
              autoComplete="new-password"
              required
              className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5 focus-visible:ring-offset-0/0 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute transition-colors -translate-y-1/2 right-3 top-1/2 text-neutral-400 hover:text-neutral-200"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full text-white bg-orange-600 border border-orange-700 hover:bg-orange-500 focus-visible:ring-orange-500"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Masuk"}
        </Button>
      </div>
      <div className="text-sm text-center text-neutral-400">
        Belum punya akun?{" "}
        <a
          href="/register"
          className="underline underline-offset-4 text-neutral-200 hover:text-white"
        >
          Daftar
        </a>
      </div>
    </form>
  );
}
