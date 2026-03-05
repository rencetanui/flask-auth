import React, { useEffect } from "react";

export default function SlideOver({ open, onClose, title, children }) {
  // Close on ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md">
      {/* Backdrop (blur + dark) */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-2 hover:bg-gray-100"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100%-57px)]">
          {children}
        </div>
      </div>
    </div>
  );
}