import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm({
  className,
  isLoading = false,
  // Live validation flags from page (optional)
  isUsernameInvalid,
  isPasswordInvalid,
  // Change handlers from page (optional)
  onUsernameChange,
  onPasswordChange,
  // ...rest props forwarded to <form>
  ...props
}) {
  return (
    <form
      className={cn("flex flex-col gap-6 text-neutral-100", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-semibold text-white">
          Buat Akun Pengguna
        </h1>
        <p className="text-sm text-neutral-400">
          Daftar untuk mulai mengajukan aduan.
        </p>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <label
            htmlFor="nama"
            className="text-neutral-300 text-sm font-medium"
          >
            Nama Pengguna
          </label>
          <Input
            id="nama"
            name="nama"
            type="text"
            placeholder="Masukkan Nama"
            autoComplete="off"
            required
            className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="username"
            className="text-neutral-300 text-sm font-medium"
          >
            Username
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Masukkan Username"
            autoComplete="off"
            required
            className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5"
            onChange={onUsernameChange}
            aria-invalid={!!isUsernameInvalid}
            aria-describedby="username-hint"
          />
          {/* Static helper hint (turns red when invalid if prop provided) */}
          <p
            id="username-hint"
            className={cn(
              "mt-1 text-xs",
              isUsernameInvalid ? "text-red-400" : "text-neutral-500"
            )}
          >
            Username minimal 3 karakter
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="password"
            className="text-neutral-300 text-sm font-medium"
          >
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Masukkan Password"
            autoComplete="new-password"
            required
            className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5"
            onChange={onPasswordChange}
            aria-invalid={!!isPasswordInvalid}
            aria-describedby="password-hint"
          />
          {/* Static helper hint (turns red when invalid if prop provided) */}
          <p
            id="password-hint"
            className={cn(
              "mt-1 text-xs",
              isPasswordInvalid ? "text-red-400" : "text-neutral-500"
            )}
          >
            Password minimal 8 karakter
          </p>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-neutral-300 text-sm font-medium"
          >
            Konfirmasi Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Ulangi Password"
            autoComplete="new-password"
            required
            className="bg-neutral-900 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 transition-[box-shadow,border-color] duration-200 ease-out focus-visible:border-orange-500 focus-visible:ring-orange-500 focus-visible:ring-0.5"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-600 hover:bg-orange-500 text-white border border-orange-700 focus-visible:ring-orange-500"
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Daftar"}
        </Button>
      </div>

      <div className="text-center text-sm text-neutral-400">
        Sudah punya akun? {""}
        <a
          href="/"
          className="underline underline-offset-4 text-neutral-200 hover:text-white"
        >
          Login
        </a>
      </div>
    </form>
  );
}
