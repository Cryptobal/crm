/**
 * API Route para generar PDF completo de presentación usando Playwright
 * 
 * Flujo:
 * 1. Recibe uniqueId de la presentación
 * 2. Valida que la presentación existe y está activa
 * 3. Abre Playwright en viewport 1440x1018 (ratio A4 landscape)
 * 4. Navega a /p/{uniqueId}?mode=pdf CON bypass de Vercel Deployment Protection
 * 5. Fuerza visibilidad de todos los elementos (override framer-motion)
 * 6. Genera PDF landscape A4 con page-breaks entre secciones
 * 7. Retorna PDF como descarga
 * 
 * IMPORTANTE: Requiere VERCEL_AUTOMATION_BYPASS_SECRET en env vars de Vercel
 * (Project Settings → Deployment Protection → Protection Bypass for Automation)
 * 
 * PRODUCCIÓN: Usa @sparticuz/chromium optimizado para Vercel
 */

import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright-core';
import chromiumPkg from '@sparticuz/chromium';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro: 60s timeout

interface GeneratePresentationRequest {
  uniqueId: string;
}

export async function POST(request: NextRequest) {
  let browser;
  
  try {
    const body: GeneratePresentationRequest = await request.json();
    const { uniqueId } = body;
    
    if (!uniqueId) {
      return NextResponse.json(
        { error: 'Falta uniqueId de la presentación' },
        { status: 400 }
      );
    }
    
    // Validar que la presentación existe
    const presentation = await prisma.presentation.findUnique({
      where: { uniqueId },
    });
    
    if (!presentation) {
      return NextResponse.json(
        { error: 'Presentación no encontrada' },
        { status: 404 }
      );
    }
    
    if (presentation.status === 'draft') {
      return NextResponse.json(
        { error: 'La presentación aún no ha sido enviada' },
        { status: 400 }
      );
    }
    
    // ── Construir URL ──
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL 
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // Secret para bypass de Vercel Deployment Protection
    // Se configura en: Vercel → Project Settings → Deployment Protection → Protection Bypass for Automation
    const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    
    // Construir URL con bypass como query param (método más confiable)
    const urlParams = new URLSearchParams({ mode: 'pdf' });
    if (bypassSecret) {
      urlParams.set('x-vercel-protection-bypass', bypassSecret);
    }
    const pdfUrl = `${baseUrl}/p/${uniqueId}?${urlParams.toString()}`;
    
    console.log(`[PDF] Generando presentación completa: ${baseUrl}/p/${uniqueId}?mode=pdf`);
    console.log(`[PDF] Bypass secret configurado: ${bypassSecret ? 'SÍ' : 'NO'}`);
    console.log(`[PDF] Base URL: ${baseUrl}`);
    
    // ── Configuración de Chromium para Vercel ──
    const isDev = process.env.NODE_ENV === 'development';
    const executablePath = isDev 
      ? undefined
      : await chromiumPkg.executablePath();
    
    browser = await chromium.launch({
      executablePath,
      headless: true,
      args: isDev ? [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ] : chromiumPkg.args,
    });
    
    // Viewport: 1440x1018 = ratio exacto A4 landscape (297:210)
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1018 },
      deviceScaleFactor: 1,
      // Headers en TODAS las requests del browser:
      // - x-vercel-protection-bypass: pasa la protección de deployment
      // - x-vercel-set-bypass-cookie: hace que Vercel setee cookie para sub-recursos (JS, CSS, imgs)
      extraHTTPHeaders: {
        ...(bypassSecret ? {
          'x-vercel-protection-bypass': bypassSecret,
          'x-vercel-set-bypass-cookie': 'samesitenone',
        } : {}),
      },
    });
    
    // También setear la cookie de bypass directamente (triple seguridad)
    if (bypassSecret) {
      const domain = new URL(baseUrl).hostname;
      await context.addCookies([{
        name: 'x-vercel-protection-bypass',
        value: bypassSecret,
        domain,
        path: '/',
      }]);
    }
    
    const page = await context.newPage();
    
    // ── Navegar a la presentación en modo PDF ──
    await page.goto(pdfUrl, { 
      waitUntil: 'networkidle',
      timeout: 45000,
    });
    
    // Verificar que NO estamos en la página de login de Vercel
    const pageTitle = await page.title();
    const pageUrl = page.url();
    if (pageTitle.includes('Vercel') || pageUrl.includes('vercel.com/login')) {
      console.error('[PDF] BLOQUEADO por Vercel Deployment Protection. Configura VERCEL_AUTOMATION_BYPASS_SECRET.');
      throw new Error(
        'Bloqueado por Vercel Deployment Protection. ' +
        'Configura VERCEL_AUTOMATION_BYPASS_SECRET en las env vars del proyecto.'
      );
    }
    
    // Esperar a que React se hidrate y Framer Motion inicialice
    await page.waitForTimeout(3000);
    
    // ── PASO 1: Inyectar CSS de respaldo ──
    await page.addStyleTag({
      content: `
        [style] {
          opacity: 1 !important;
          transform: none !important;
        }
        * {
          animation: none !important;
          transition: none !important;
        }
      `,
    });
    
    // ── PASO 2: Forzar visibilidad via JavaScript ──
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        if (!(el instanceof HTMLElement)) return;
        
        // Remover inline opacity (FM initial state)
        if (el.style.opacity !== '' && parseFloat(el.style.opacity) < 0.1) {
          el.style.removeProperty('opacity');
        }
        
        // Remover inline transform (FM animation offsets)
        if (el.style.transform && el.style.transform !== 'none') {
          el.style.removeProperty('transform');
        }
      });
    });
    
    // ── PASO 3: Scroll para triggear lazy loading de imágenes ──
    await page.evaluate(async () => {
      const totalHeight = document.body.scrollHeight;
      const step = window.innerHeight;
      for (let y = 0; y < totalHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 200));
      }
      window.scrollTo(0, 0);
    });
    
    // Pausa final para estabilizar estilos e imágenes
    await page.waitForTimeout(1500);
    
    // ── Generar PDF ──
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });
    
    await browser.close();
    browser = null;
    
    // Nombre del archivo
    const clientData = presentation.clientData as any;
    const companyName = clientData?.client?.company_name 
      || clientData?.account?.Account_Name 
      || 'Cliente';
    const quoteNumber = clientData?.quote?.number 
      || clientData?.quote?.Quote_Number 
      || '';
    
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '').replace(/\s+/g, '_');
    const fileName = `Presentacion_Gard_${safeCompanyName}${quoteNumber ? `_${quoteNumber}` : ''}.pdf`;
    
    console.log(`[PDF] Presentación generada: ${fileName} (${pdfBuffer.length} bytes)`);
    
    const uint8Array = new Uint8Array(pdfBuffer);
    
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
    
  } catch (error: any) {
    console.error('[PDF] Error generando presentación:', error);
    
    if (browser) {
      try { await browser.close(); } catch {}
    }
    
    return NextResponse.json(
      { error: 'Error generando PDF de la presentación', details: error.message },
      { status: 500 }
    );
  }
}
