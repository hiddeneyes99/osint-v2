import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "[&:-webkit-autofill]:![box-shadow:0_0_0_1000px_rgba(9,5,26,0.98)_inset]",
          "[&:-webkit-autofill]:![-webkit-text-fill-color:rgba(255,255,255,0.9)]",
          "[&:-webkit-autofill:hover]:![box-shadow:0_0_0_1000px_rgba(9,5,26,0.98)_inset]",
          "[&:-webkit-autofill:focus]:![box-shadow:0_0_0_1000px_rgba(9,5,26,0.98)_inset]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
