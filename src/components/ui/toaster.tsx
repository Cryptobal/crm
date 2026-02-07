/**
 * Global toast host (Sonner)
 */
"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="bottom-right"
      closeButton
      expand={false}
      duration={5000}
    />
  );
}
