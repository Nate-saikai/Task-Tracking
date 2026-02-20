import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      // "w-fit" ensures the Root doesn't force a 100% width if not needed
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col w-fit",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:h-fit",
  {
    variants: {
      variant: {
        default: "bg-muted/50 p-1 rounded-xl gap-0 w-fit",
        line: "gap-4 bg-transparent border-b justify-start rounded-none w-fit",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Base: Transparent background so it blends into the TabsList's muted color
        "relative inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium transition-all outline-none",
        "bg-transparent text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50 rounded-lg",

        // Active State: Pops out with white background and a soft shadow
        "data-[state=active]:bg-background data-[state=active]:text-foreground",
        "data-[state=active]:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.1)]",

        // Remove any borders that might look like "buttons"
        "border-none",

        // Ensure width is based on content
        "w-auto whitespace-nowrap",

        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      // Content can grow to 100%, but the List above will stay narrow
      className={cn("flex-1 outline-none pt-4", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }