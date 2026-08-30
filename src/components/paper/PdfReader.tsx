import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

// Self-hosted worker (copied to public/) so the viewer works offline and on Vercel.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/paper/pdfjs/pdf.worker.min.mjs';

interface PdfReaderProps {
  url: string;
}

/**
 * Minimal, theme-consistent PDF reader using PDF.js.
 * Renders the document into a scrollable canvas series with page navigation
 * and zoom controls — reliable across browsers (no dependence on the native
 * PDF plugin, which renders as a black box in some embedded contexts).
 */
export const PdfReader: React.FC<PdfReaderProps> = ({ url }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // scale = 0 means "auto fit to container width"
  const [scale, setScale] = useState(0);
  const [autoScale, setAutoScale] = useState(1.1);
  const [error, setError] = useState<string | null>(null);
  const pageRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  const effectiveScale = scale > 0 ? scale : autoScale;

  // Load document
  useEffect(() => {
    let cancelled = false;
    setError(null);
    pdfjsLib
      .getDocument({ url })
      .promise.then((d) => {
        if (!cancelled) {
          setDoc(d);
          setPageCount(d.numPages);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  // Auto-fit: compute scale so the widest page fills the container width.
  useEffect(() => {
    if (!doc || !containerRef.current) return;
    let cancelled = false;
    let maxPageWidth = 0;

    const compute = async () => {
      for (let p = 1; p <= Math.min(3, doc.numPages); p++) {
        const page = await doc.getPage(p);
        const v = page.getViewport({ scale: 1 });
        maxPageWidth = Math.max(maxPageWidth, v.width);
      }
      if (cancelled || !containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 24; // padding
      setAutoScale(containerWidth / maxPageWidth);
    };
    compute();

    const ro = new ResizeObserver(() => {
      if (!containerRef.current || maxPageWidth === 0) return;
      const containerWidth = containerRef.current.clientWidth - 24;
      setAutoScale(containerWidth / maxPageWidth);
    });
    ro.observe(containerRef.current);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [doc]);

  // Render all pages into canvases. Renders to an offscreen scratch canvas
  // first, then blits — this avoids any canvas-resize/in-flight race that can
  // visually corrupt (mirror/smear) the output when scale changes mid-render.
  useEffect(() => {
    if (!doc) return;
    let cancelled = false;
    const dpr = window.devicePixelRatio || 1;

    const renderAll = async () => {
      for (let p = 1; p <= doc.numPages; p++) {
        if (cancelled) return;
        const canvas = pageRefs.current.get(p);
        if (!canvas) continue;
        try {
          const page = await doc.getPage(p);

          const cssScale = effectiveScale;
          const deviceScale = cssScale * dpr;
          const viewport = page.getViewport({ scale: deviceScale });

          const w = Math.floor(viewport.width);
          const h = Math.floor(viewport.height);

          // Scratch render at device resolution
          const scratch = document.createElement('canvas');
          scratch.width = w;
          scratch.height = h;
          const sctx = scratch.getContext('2d');
          if (!sctx) continue;
          sctx.fillStyle = '#ffffff';
          sctx.fillRect(0, 0, w, h);
          await page.render({ canvas: scratch, canvasContext: sctx, viewport }).promise;

          if (cancelled) return;

          // Blit to the visible canvas (no scale transform — direct copy)
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = `${Math.floor(w / dpr)}px`;
          canvas.style.height = `${Math.floor(h / dpr)}px`;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(scratch, 0, 0);
        } catch {
          /* skip failed page */
        }
      }
    };

    renderAll();
    return () => {
      cancelled = true;
    };
  }, [doc, effectiveScale]);

  const scrollToPage = (p: number) => {
    const canvas = pageRefs.current.get(p);
    if (canvas && containerRef.current) {
      containerRef.current.scrollTo({
        top: canvas.offsetTop - containerRef.current.offsetTop - 8,
        behavior: 'smooth',
      });
    }
    setCurrentPage(p);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-rose-400 p-6 text-center">
        Failed to load PDF: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-neutral-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-neutral-200 shrink-0 text-[11px]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 font-mono tabular-nums min-w-[72px] text-center">
            {currentPage} / {pageCount || '…'}
          </span>
          <button
            onClick={() => scrollToPage(Math.min(pageCount, currentPage + 1))}
            disabled={currentPage >= pageCount}
            className="p-1 rounded-sm hover:bg-neutral-800 disabled:opacity-40 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale(s => Math.max(0.5, (s > 0 ? s : autoScale) - 0.15))}
            className="p-1 rounded-sm hover:bg-neutral-800 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 font-mono tabular-nums min-w-[44px] text-center">
            {scale === 0 ? 'Fit' : `${Math.round(effectiveScale * 100)}%`}
          </span>
          <button
            onClick={() => setScale(s => Math.min(2.5, (s > 0 ? s : autoScale) + 0.15))}
            className="p-1 rounded-sm hover:bg-neutral-800 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setScale(0)}
            className="p-1 rounded-sm hover:bg-neutral-800 transition-colors ml-1"
            title="Fit to width"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document scroll area */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-auto p-3 space-y-3"
        onScroll={(e) => {
          // Track current page from scroll position
          const el = e.currentTarget;
          let best = 1;
          let bestDist = Infinity;
          pageRefs.current.forEach((canvas, p) => {
            const d = Math.abs(canvas.offsetTop - el.offsetTop - el.scrollTop);
            if (d < bestDist) {
              bestDist = d;
              best = p;
            }
          });
          if (best !== currentPage) setCurrentPage(best);
        }}
      >
        {!doc && (
          <div className="flex items-center justify-center h-full text-xs text-neutral-500">
            Loading paper…
          </div>
        )}
        {doc &&
          Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <canvas
              key={p}
              ref={(el) => {
                if (el) pageRefs.current.set(p, el);
                else pageRefs.current.delete(p);
              }}
              className="block mx-auto shadow-lg shadow-black/40 bg-white rounded-[2px]"
            />
          ))}
      </div>
    </div>
  );
};
