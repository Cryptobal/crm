"use client";

import { LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "cards";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-md border border-border">
      <Button
        size="icon"
        variant="ghost"
        className={`h-8 w-8 rounded-r-none ${view === "list" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
        onClick={() => onChange("list")}
        title="Vista lista"
      >
        <LayoutList className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={`h-8 w-8 rounded-l-none border-l border-border ${view === "cards" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
        onClick={() => onChange("cards")}
        title="Vista tarjetas"
      >
        <LayoutGrid className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
