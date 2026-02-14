"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";

export type GuardiaSearchResult = {
  id: string;
  nombreCompleto: string;
  code?: string;
  rut?: string;
};

interface GuardiaSearchInputProps {
  value: string;
  onChange: (patch: { guardiaNombre: string; guardiaId?: string | null }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const DEBOUNCE_MS = 250;

export function GuardiaSearchInput({
  value,
  onChange,
  placeholder = "Buscar o escribir nombre",
  className = "",
  disabled = false,
}: GuardiaSearchInputProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<GuardiaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const updatePosition = useCallback(() => {
    if (inputRef.current && typeof document !== "undefined") {
      const rect = inputRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 200),
      });
    }
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      setOpen(false);
      setPosition(null);
      return;
    }
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/ops/guardias-active-search?q=${encodeURIComponent(q)}`,
        { signal: abortRef.current.signal, credentials: "include" }
      );
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setResults(json.data);
        setHighlightIdx(-1);
        if (json.data.length > 0) {
          setOpen(true);
          updatePosition();
        } else {
          setOpen(false);
          setPosition(null);
        }
      } else {
        setResults([]);
        setOpen(false);
        setPosition(null);
      }
    } catch {
      setResults([]);
      setOpen(false);
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [updatePosition]);

  useLayoutEffect(() => {
    if (open && results.length > 0) {
      updatePosition();
    }
  }, [open, results.length, updatePosition]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setQuery(v);
      onChange({ guardiaNombre: v, guardiaId: null });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchResults(v);
      }, DEBOUNCE_MS);
    },
    [onChange, fetchResults]
  );

  const handleSelect = useCallback(
    (g: GuardiaSearchResult) => {
      setQuery(g.nombreCompleto);
      onChange({ guardiaNombre: g.nombreCompleto, guardiaId: g.id });
      setOpen(false);
      setResults([]);
      setPosition(null);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || results.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && highlightIdx >= 0 && results[highlightIdx]) {
        e.preventDefault();
        handleSelect(results[highlightIdx]);
      } else if (e.key === "Escape") {
        setOpen(false);
        setPosition(null);
      }
    },
    [open, results, highlightIdx, handleSelect]
  );

  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (document.querySelector("[data-guardia-dropdown]")?.contains(target)) return;
      setOpen(false);
      setPosition(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  const dropdown =
    open &&
    results.length > 0 &&
    position &&
    typeof document !== "undefined" &&
    createPortal(
      <ul
        data-guardia-dropdown
        role="listbox"
        className="fixed z-[9999] max-h-52 overflow-auto rounded-lg border border-border bg-popover py-1 text-sm shadow-xl"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          minWidth: 220,
        }}
      >
        {results.map((g, idx) => (
          <li
            key={g.id}
            role="option"
            aria-selected={idx === highlightIdx}
            className={`cursor-pointer px-3 py-2.5 ${
              idx === highlightIdx ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
            }`}
            onClick={() => handleSelect(g)}
          >
            <span className="font-medium">{g.nombreCompleto}</span>
            {g.code && (
              <span className="ml-2 text-xs text-muted-foreground">Cód. {g.code}</span>
            )}
          </li>
        ))}
      </ul>,
      document.body
    );

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      {dropdown}
      {loading && query.length >= 2 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          Buscando…
        </div>
      )}
    </div>
  );
}
