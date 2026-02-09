"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, Mail, MessageSquare, FileText, MapPin } from "lucide-react";

export interface RecordAction {
  label: string;
  icon: typeof Pencil;
  onClick: () => void;
  variant?: "default" | "destructive";
  hidden?: boolean;
}

interface RecordActionsProps {
  actions: RecordAction[];
}

const ICON_MAP: Record<string, typeof Pencil> = {
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  FileText,
  MapPin,
};

export function RecordActions({ actions }: RecordActionsProps) {
  const visible = actions.filter((a) => !a.hidden);
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 w-9 p-0">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Acciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {visible.map((action, i) => {
          const Icon = action.icon;
          const isDestructive = action.variant === "destructive";

          return (
            <div key={i}>
              {isDestructive && i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={action.onClick}
                className={
                  isDestructive
                    ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                    : ""
                }
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
