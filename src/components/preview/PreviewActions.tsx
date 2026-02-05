'use client';

/**
 * Preview Actions
 * 
 * Botones de acción para la vista de preview de borrador
 */

import Link from 'next/link';
import { useState } from 'react';

interface PreviewActionsProps {
  sessionId: string;
  companyName: string;
}

export function PreviewActions({ sessionId, companyName }: PreviewActionsProps) {
  const [isSending, setIsSending] = useState(false);

  const handleCancel = () => {
    // Intentar cerrar la ventana (si es popup)
    if (window.opener) {
      window.close();
    } else {
      // Si no es popup, volver atrás
      window.history.back();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 p-4 shadow-2xl">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3 justify-center items-center">
        <Link
          href={`/api/presentations/send-email?sessionId=${sessionId}`}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg hover:scale-105 transition-transform text-center shadow-lg shadow-teal-500/50"
          onClick={() => setIsSending(true)}
        >
          {isSending ? '📤 Enviando...' : '📧 Enviar por Email'}
        </Link>
        
        <Link
          href="/admin/presentations"
          className="w-full sm:w-auto px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors text-center"
        >
          💾 Guardar como Borrador
        </Link>
        
        <button
          onClick={handleCancel}
          className="w-full sm:w-auto px-8 py-3 bg-red-500/20 text-red-300 font-semibold rounded-lg hover:bg-red-500/30 transition-colors"
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}
