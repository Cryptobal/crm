"use client";

import { useEffect, useMemo, useState } from "react";

interface MapPoint {
  id: string;
  label: string;
  lat?: number | null;
  lng?: number | null;
  status?: string;
}

export function MonitoreoMap({ points }: { points: MapPoint[] }) {
  const pointsWithCoords = useMemo(
    () => points.filter((p) => p.lat != null && p.lng != null),
    [points],
  );
  const [selectedId, setSelectedId] = useState<string | null>(pointsWithCoords[0]?.id ?? null);

  useEffect(() => {
    if (!pointsWithCoords.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !pointsWithCoords.some((p) => p.id === selectedId)) {
      setSelectedId(pointsWithCoords[0].id);
    }
  }, [pointsWithCoords, selectedId]);

  const selected = pointsWithCoords.find((p) => p.id === selectedId) ?? pointsWithCoords[0] ?? null;
  const embedUrl =
    selected?.lat != null && selected?.lng != null
      ? `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=16&output=embed`
      : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 h-[300px] sm:h-[400px] lg:h-[600px] overflow-auto space-y-3">
      {embedUrl ? (
        <iframe
          key={selected?.id}
          title="Mapa de monitoreo de rondas"
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[220px] sm:h-[300px] lg:h-[380px] rounded border border-border"
        />
      ) : (
        <div className="w-full h-[220px] sm:h-[300px] lg:h-[380px] rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
          Sin coordenadas para mostrar en mapa.
        </div>
      )}

      <div className="space-y-2">
        {points.map((p) => {
          const isSelected = p.id === selected?.id;
          return (
            <button
              type="button"
              key={p.id}
              className={`w-full text-left rounded border p-2 text-xs ${
                isSelected ? "border-primary/50 bg-primary/5" : "border-border"
              }`}
              onClick={() => setSelectedId(p.id)}
            >
              <p className="font-medium">{p.label}</p>
              <p className="text-muted-foreground">
                {p.lat != null && p.lng != null ? `${p.lat}, ${p.lng}` : "Sin coordenadas"}
              </p>
              {p.status && <p className="text-muted-foreground">Estado: {p.status}</p>}
            </button>
          );
        })}
        {!points.length && <p className="text-xs text-muted-foreground">Sin rondas activas.</p>}
      </div>
    </div>
  );
}
