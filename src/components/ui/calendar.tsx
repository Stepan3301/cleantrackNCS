import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-2",
        caption_label: "text-sm font-medium text-primary flex-1 text-center",
        caption_dropdowns: "flex justify-center gap-1 pt-2",
        dropdown: "relative inline-flex bg-background border border-input rounded-md shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
        dropdown_month: "appearance-none bg-transparent pl-3 pr-8 py-1 text-sm rounded-md focus:outline-none",
        dropdown_year: "appearance-none bg-transparent pl-3 pr-8 py-1 text-sm rounded-md focus:outline-none",
        dropdown_icon: "absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-background p-0 opacity-70 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "absolute left-1 flex items-center justify-center rounded-full",
        nav_button_next: "absolute right-1 flex items-center justify-center rounded-full",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 h-10 font-medium text-[0.8rem] flex items-center justify-center",
        row: "flex w-full mt-2",
        cell: "relative h-10 w-10 text-center rounded-md p-0 focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/40 [&:has([aria-selected].day-range-end)]:rounded-r-md",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors focus:ring-2 focus:ring-primary"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md",
        day_today: "bg-accent text-accent-foreground border border-primary/30",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-40",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
