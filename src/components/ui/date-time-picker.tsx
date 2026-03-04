"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date & time",
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const hours = value ? value.getHours() : 12;
  const minutes = value ? value.getMinutes() : 0;

  function handleDateSelect(day: Date | undefined) {
    if (!day) return;
    // Preserve existing time when picking a new date
    const withTime = setMinutes(setHours(day, hours), minutes);
    onChange(withTime);
  }

  function handleHourChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!value) return;
    onChange(setHours(value, parseInt(e.target.value)));
  }

  function handleMinuteChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!value) return;
    onChange(setMinutes(value, parseInt(e.target.value)));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, "MMM d, yyyy  HH:mm") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          disabled={{ before: new Date() }}
        />
        <div className="border-t px-4 py-3 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time:</span>
          <select
            value={hours}
            onChange={handleHourChange}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {String(i).padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">:</span>
          <select
            value={minutes}
            onChange={handleMinuteChange}
            className="rounded-md border bg-background px-2 py-1 text-sm"
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                {String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
