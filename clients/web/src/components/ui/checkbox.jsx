import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-neutral-700 bg-neutral-900/60 shadow-xs transition-all outline-none",
        "hover:border-orange-500/50 hover:bg-neutral-800",
        "focus-visible:ring-[3px] focus-visible:ring-orange-500/20 focus-visible:border-orange-500",
        "data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-neutral-700 dark:bg-neutral-900/60",
        "dark:data-[state=checked]:bg-orange-500 dark:data-[state=checked]:border-orange-500",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
