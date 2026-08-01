/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-[#5F6AD2] text-white shadow-xs hover:bg-[#4F5ABF]",
            primary: "bg-[#5F6AD2] text-white shadow-xs hover:bg-[#4F5ABF]",
            destructive: "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90",
            outline: "border border-border bg-surface text-foreground shadow-xs hover:bg-surface-elevated hover:border-border-strong font-medium",
            secondary: "border border-border bg-surface text-foreground shadow-xs hover:bg-surface-elevated hover:border-border-strong font-medium",
            ghost: "hover:bg-surface hover:text-foreground text-muted-foreground font-medium",
            link: "text-[#5F6AD2] underline-offset-4 hover:underline font-medium",
        },
        size: {
            default: "h-9 px-4",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-lg px-6 text-sm",
            icon: "h-9 w-9",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = "Button";
export { Button, buttonVariants };
