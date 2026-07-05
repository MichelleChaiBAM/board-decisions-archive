"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SubjectMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function SubjectMultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select subjects...",
  disabled = false,
  id,
}: SubjectMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const toggleSubject = (subject: string) => {
    if (value.includes(subject)) {
      onChange(value.filter((s) => s !== subject));
    } else {
      onChange([...value, subject]);
    }
  };

  const removeSubject = (subject: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((s) => s !== subject));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-auto min-h-9 w-full justify-between font-normal",
            value.length === 0 && "text-muted-foreground"
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-1 py-0.5">
            {value.length > 0 ? (
              value.map((subject) => (
                <Badge
                  key={subject}
                  variant="secondary"
                  className="mr-0.5 max-w-full truncate"
                >
                  {subject}
                  <button
                    type="button"
                    className="ml-1 rounded-full outline-none ring-offset-background hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-1"
                    onClick={(e) => removeSubject(subject, e)}
                    aria-label={`Remove ${subject}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search subjects..." />
          <CommandList>
            <CommandEmpty>No subject found.</CommandEmpty>
            <CommandGroup>
              {options.map((subject) => (
                <CommandItem
                  key={subject}
                  value={subject}
                  onSelect={() => toggleSubject(subject)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value.includes(subject) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {subject}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
