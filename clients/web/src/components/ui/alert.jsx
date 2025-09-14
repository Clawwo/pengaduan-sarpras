import * as React from "react";
import { cva } from "class-variance-authority";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  // Dark, minimalist base: subtle border, dark bg, readable foreground
  "relative w-full rounded-lg border border-neutral-800 bg-neutral-900/85 text-neutral-200 px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-red-900/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant = "default",
  withIcon = true,
  icon,
  dismissible = true,
  onClose,
  floating = false,
  position = "top-center", // future positions: top-left, top-right, bottom-center, etc.
  duration, // ms; when provided, auto-dismiss after this duration
  children,
  ...props
}) {
  const [hidden, setHidden] = React.useState(false);
  const [visible, setVisible] = React.useState(false); // for enter/exit animations

  const iconColor =
    variant === "destructive" ? "text-red-500" : "text-emerald-500";
  const chosenIcon = React.useMemo(() => {
    if (!withIcon) return null;
    if (icon)
      return React.cloneElement(icon, {
        className: cn("", icon.props?.className),
      });
    return variant === "destructive" ? (
      <AlertCircle aria-hidden="true" className={cn(iconColor)} />
    ) : (
      <CheckCircle2 aria-hidden="true" className={cn(iconColor)} />
    );
  }, [withIcon, icon, variant, iconColor]);

  const handleClose = React.useCallback(() => {
    if (onClose) onClose();
    // play exit animation then unmount
    setVisible(false);
    const t = setTimeout(() => setHidden(true), 200);
    return () => clearTimeout(t);
  }, [onClose]);

  React.useEffect(() => {
    if (!duration || duration <= 0) return;
    const id = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, handleClose]);

  const overlayPosClass =
    position === "top-center"
      ? "top-4 left-1/2 -translate-x-1/2"
      : position === "top-right"
      ? "top-4 right-4"
      : position === "top-left"
      ? "top-4 left-4"
      : position === "bottom-center"
      ? "bottom-4 left-1/2 -translate-x-1/2"
      : position === "bottom-right"
      ? "bottom-4 right-4"
      : position === "bottom-left"
      ? "bottom-4 left-4"
      : "top-4 left-1/2 -translate-x-1/2";

  React.useEffect(() => {
    // trigger enter animation on mount
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    if (dismissible) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [dismissible, handleClose]);

  const alertNode = (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        "shadow-lg shadow-black/40 transition-all duration-200 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
        className
      )}
      {...props}
    >
      {chosenIcon}
      {children}
      {dismissible && (
        <button
          type="button"
          onClick={handleClose}
          aria-label="Tutup"
          title="Tutup"
          className="absolute right-2 top-2 inline-grid place-items-center rounded p-1 text-neutral-500 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );

  if (hidden) return null;

  if (!floating) return alertNode;

  return (
    <div className={cn("fixed z-50 pointer-events-none", overlayPosClass)}>
      <div className="pointer-events-auto max-w-md w-[calc(100vw-2rem)]">
        {alertNode}
      </div>
    </div>
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
