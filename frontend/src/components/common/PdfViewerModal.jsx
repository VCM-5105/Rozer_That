import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, title, exam, year, paperType }) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${(title || 'PYQ_Question_Paper').replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    if (pdfUrl.startsWith('data:')) {
      const pdfWindow = window.open("");
      if (pdfWindow) {
        pdfWindow.document.write(`<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;"></iframe>`);
      }
    } else {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-5xl h-[90vh] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-500 text-[10px] font-bold military-font uppercase">
                  {exam || 'DEFENCE'} • {year || 'PYQ'}
                </span>
                {paperType && (
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{paperType}</span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] military-font">{title || 'Question Paper PDF'}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer military-font uppercase"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button
              onClick={handleOpenNewTab}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer military-font uppercase"
            >
              <ExternalLink className="w-4 h-4" /> Open Tab
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-red-500/20 hover:text-red-400 text-[var(--text-secondary)] border border-[var(--border-color)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Embedded Frame */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={title || 'PYQ PDF Document'}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 animate-pulse" />
              <p className="text-sm font-semibold">No PDF document URL found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
