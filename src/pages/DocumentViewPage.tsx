import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { StatusBadge, GhostButton, PrimaryButton, SectionCard, KeyValue } from "../components/common";
import {
  Upload,
  Download,
  Search,
  MoreVertical,
  ShieldCheck,
  UserPlus,
  MapPin,
  ArrowLeft,
  X,
  Printer,
  Mail,
  Lock,
  History,
  RotateCcw,
} from "lucide-react";
// Removed mock documentTimeline import
import { useToast } from "../components/Toast";
import type { StatusKey } from "../types";
import { Modal } from "../components/modals/Modal";
import { DocumentMockPreview } from "../components/DocumentMockPreview";
import { documentsApi, type DocumentTableRow } from "../api/documents";

export function DocumentViewPage({ document, onBack }: { document: any; onBack: () => void }) {
  const { documents: documentRows, setDocuments } = useAppContext();
  const { showToast } = useToast();

  const liveDoc =
    documentRows.find((d: DocumentTableRow) => d[6] === document?.[6]) ||
    documentRows.find((d: DocumentTableRow) => d[0] === document?.[0] && d[1] === document?.[1]) ||
    document ||
    null;

  const dynamicTimeline = liveDoc ? [
    [`File uploaded by ${liveDoc[2] || "User"}`, liveDoc[3] || "Unknown date", "blue"],
    ["Automated scan complete - No errors found", liveDoc[3] || "Unknown date", "slate"],
    [`Status updated to ${liveDoc[5] || "Pending"}`, liveDoc[3] || "Unknown date", "slate"],
  ] : [];

  if (!liveDoc) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-[12px] text-slate-500 font-semibold tracking-wide">
          <button onClick={onBack} className="hover:text-brand-500 transition">
            Documents
          </button>
          <span>&nbsp;›&nbsp;</span>
          <span className="text-slate-700">Unavailable</span>
        </div>

        <SectionCard className="p-8">
          <div className="text-[20px] font-bold text-slate-900">Document unavailable</div>
          <p className="mt-2 max-w-[520px] text-[14px] text-slate-500">
            This document is no longer available in the current backend dataset. It may have been deleted or the page was reloaded without an active document selection.
          </p>
          <button
            onClick={onBack}
            className="mt-5 rounded-lg bg-brand-500 px-5 py-3 text-[14px] font-semibold text-white hover:bg-brand-600 transition"
          >
            Back to Documents
          </button>
        </SectionCard>
      </div>
    );
  }

  const [fileName, orderId, uploadedBy, date, size, status, documentId] = liveDoc as DocumentTableRow;

  // Reactive micro-states
  const [zoom, setZoom] = useState(100);
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewQuery, setPreviewQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeVersion, setActiveVersion] = useState("V2");
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Dynamic state selectors
  const currentSize = activeVersion === "V2" ? size : "1.1 MB";
  const currentDate = activeVersion === "V2" ? date : "Oct 22, 2023";
  const currentUploadedBy = activeVersion === "V2" ? uploadedBy : "Sarah J. Miller";

  const handleZoomOut = () => {
    setZoom((z) => Math.max(50, z - 10));
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(200, z + 10));
  };

  const handleApprove = async () => {
    try {
      const updatedRow = await documentsApi.updateStatus(documentId, "Approved");
      setDocuments((prev: any) =>
        prev.map((d: any) =>
          d[6] === documentId ? updatedRow : d
        )
      );
      showToast(`Document "${fileName}" approved successfully!`, { variant: "success" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document approval failed", { variant: "error" });
    }
  };

  const handleReject = async () => {
    try {
      const updatedRow = await documentsApi.updateStatus(documentId, "Rejected");
      setDocuments((prev: any) =>
        prev.map((d: any) =>
          d[6] === documentId ? updatedRow : d
        )
      );
      showToast(`Document "${fileName}" rejected and changes requested.`, { variant: "error" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document rejection failed", { variant: "error" });
    }
  };

  const handleDownload = async () => {
    showToast(`Downloading "${fileName}"...`, { variant: "info" });
    try {
      const url = await documentsApi.getDownloadUrl(documentId);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      showToast(`File "${fileName}" downloaded successfully!`, { variant: "success" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Document download failed", { variant: "error" });
    }
  };

  const handleShare = () => {
    showToast("Generating secure portal share link...", { variant: "info" });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://engage.closingengage.com/share/doc-${orderId.replace('#ORD-', '')}`);
    }
    setTimeout(() => {
      showToast("Portal share link copied to clipboard!", { variant: "success" });
    }, 1000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[12px] text-slate-500 font-semibold tracking-wide">
        <button onClick={onBack} className="hover:text-brand-500 transition">
          Documents
        </button>
        <span>&nbsp;›&nbsp;</span>
        <span className="text-slate-700">{fileName}</span>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 rounded-full border border-line bg-white p-2 text-brand-500 hover:bg-slate-50 transition focus:outline-none"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-bold text-slate-900 leading-none">{fileName}</h1>
              <StatusBadge status={status as StatusKey} />
            </div>
            <div className="mt-2 flex items-center gap-4 text-[14px] text-slate-500">
              <span>
                Order ID: <span className="font-semibold text-brand-500">{orderId}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-medium">Priority: High</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <GhostButton
            onClick={handleShare}
            className="w-[150px] h-[46px] justify-center border-brand-300 text-brand-600 bg-brand-50/50 hover:bg-brand-50 px-0"
          >
            <Upload size={15} />
            Share
          </GhostButton>
        </div>
      </div>
      <div className="grid grid-cols-[1.6fr_0.78fr] gap-5">
        <SectionCard className="overflow-hidden p-0 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3">
            <div className="flex items-center gap-3 text-[12px] font-semibold text-slate-600">
              <button onClick={handleZoomOut} className="rounded bg-[#F2F5FA] px-3 py-1 hover:bg-slate-100 transition focus:outline-none">−</button>
              <span>{zoom}%</span>
              <button onClick={handleZoomIn} className="rounded bg-[#F2F5FA] px-3 py-1 hover:bg-slate-100 transition focus:outline-none">+</button>
            </div>
            <div className="text-[12px] font-semibold text-slate-600">Page 1 of 5</div>
            <div className="flex items-center gap-4 text-slate-500">
              <Download size={15} className="cursor-pointer hover:text-slate-700 transition" onClick={handleDownload} />
              
              {searchOpen ? (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 animate-in slide-in-from-right-3 duration-200">
                  <input
                    type="text"
                    placeholder="Find text..."
                    value={previewQuery}
                    onChange={(e) => setPreviewQuery(e.target.value)}
                    className="w-32 bg-transparent text-[12px] text-slate-700 outline-none border-none placeholder:text-slate-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && previewQuery) {
                        showToast(`Searched for "${previewQuery}" (0 matches found)`, { variant: "info" });
                      }
                    }}
                  />
                  <X size={12} className="cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => { setSearchOpen(false); setPreviewQuery(""); }} />
                </div>
              ) : (
                <Search size={15} className="cursor-pointer hover:text-slate-700 transition" onClick={() => setSearchOpen(true)} />
              )}

              <div className="relative">
                <MoreVertical size={15} className="cursor-pointer hover:text-slate-700 transition" onClick={() => setMenuOpen(!menuOpen)} />
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-6 z-20 w-[180px] rounded-xl border border-line bg-white py-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => { setMenuOpen(false); showToast("Connecting to print pool...", { variant: "info" }); setTimeout(() => showToast("Sent to printer successfully!", { variant: "success" }), 1000); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Printer size={13} /> Print Document
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); showToast(`Email dispatched to ${uploadedBy}`, { variant: "success" }); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                      >
                        <Mail size={13} /> Email Partner
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); showToast("Document marked as compliance locked.", { variant: "info" }); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition border-t border-line"
                      >
                        <Lock size={13} /> Lock Verification
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-[#DDE6F2] p-6 overflow-auto min-h-[520px] max-h-[520px] flex items-start justify-center">
            <div 
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: "top center", 
                height: `${520 * (zoom / 100)}px`, 
                width: `${390 * (zoom / 100)}px`,
                transition: "transform 0.15s ease-out" 
              }} 
              className="bg-white shadow-xl rounded-[4px] border border-slate-200 flex-shrink-0 overflow-hidden"
            >
              <DocumentMockPreview fileName={fileName} />
            </div>
          </div>
        </SectionCard>
        <div className="space-y-5">
          <SectionCard className="p-5">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Verification Action</div>
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 py-3 text-[14px] font-semibold text-white shadow-md hover:bg-brand-600 transition focus:outline-none"
              >
                <ShieldCheck size={16} />
                Approve Document
              </button>
              <button
                onClick={handleReject}
                className="w-full rounded-lg border border-[#EF9B98] py-3 text-[14px] font-semibold text-[#DD514B] hover:bg-rose-50 transition focus:outline-none"
              >
                Reject &amp; Request Changes
              </button>
              <button
                onClick={handleDownload}
                className="w-full rounded-lg bg-[#EEF3FA] py-3 text-[14px] font-semibold text-slate-600 hover:bg-slate-200 transition focus:outline-none"
              >
                Download File
              </button>
            </div>
          </SectionCard>
          <SectionCard className="p-5">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">File Information</div>
            <KeyValue
              rows={[
                ["Size", currentSize],
                ["Type", "PDF Document"],
                ["Upload Date", currentDate],
                ["Uploaded By", currentUploadedBy],
              ]}
            />
          </SectionCard>
          <SectionCard className="p-5">
            <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Order Context</div>
            <div className="space-y-3 text-[14px]">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded bg-[#EEF5FF] p-2 text-brand-500">
                  <UserPlus size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Assigned Notary</div>
                  <div className="font-semibold text-slate-700">Jane Simmons</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded bg-[#EEF5FF] p-2 text-brand-500">
                  <MapPin size={14} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Property Location</div>
                  <div className="font-semibold text-slate-700">123 Maple St, Austin, TX</div>
                </div>
              </div>
            </div>
          </SectionCard>
          <SectionCard className="p-5">
            <div className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Activity Log</div>
            <div className="space-y-5">
              {dynamicTimeline.map(([title, date, tone], index) => (
                <div key={index} className="relative flex gap-4">
                  <div className="relative mt-1 flex flex-col items-center">
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        tone === "blue" ? "border-2 border-brand-500 text-brand-500" : "border-2 border-[#D8E1EE] text-transparent"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${tone === "blue" ? "bg-brand-500" : "bg-[#D8E1EE]"}`} />
                    </div>
                    {index < dynamicTimeline.length - 1 ? <div className="mt-2 h-10 w-px bg-[#E7ECF4]" /> : null}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-slate-700">{title}</div>
                    <div className="text-[12px] text-slate-400 font-medium">{date}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-500 hover:text-brand-600 transition focus:outline-none"
            >
              View Full History
            </button>
          </SectionCard>
        </div>
      </div>

      {/* VERSION HISTORY MODAL */}
      {showVersionModal && (
        <Modal onClose={() => setShowVersionModal(false)} widthClass="max-w-[500px]">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-[20px] font-bold text-slate-900">Document Version History</h2>
                <p className="mt-1 text-[13px] text-slate-500">View and restore previous file uploads</p>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 transition-all ${
                  activeVersion === "V2"
                    ? "border-brand-500 bg-brand-50/20"
                    : "border-slate-200 hover:border-brand-300 cursor-pointer"
                }`}
                onClick={() => activeVersion !== "V2" && setActiveVersion("V2")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-slate-800">Version 2 (V2)</span>
                      {activeVersion === "V2" && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">Active</span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-slate-500">Uploaded by Northway Holdings</div>
                    <div className="mt-2 text-[11px] font-medium text-slate-400">Oct 24, 2023 • 1.2 MB</div>
                  </div>
                  {activeVersion !== "V2" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveVersion("V2"); showToast("Switched back to V2 (Latest)", { variant: "success" }); }}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-brand-500 hover:text-white transition"
                    >
                      <RotateCcw size={12} /> Activate
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 transition-all ${
                  activeVersion === "V1"
                    ? "border-brand-500 bg-brand-50/20"
                    : "border-slate-200 hover:border-brand-300 cursor-pointer"
                }`}
                onClick={() => activeVersion !== "V1" && setActiveVersion("V1")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-slate-800">Version 1 (V1)</span>
                      {activeVersion === "V1" && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">Active</span>
                      )}
                    </div>
                    <div className="mt-1 text-[12px] text-slate-500">Uploaded by Sarah J. Miller</div>
                    <div className="mt-2 text-[11px] font-medium text-slate-400">Oct 22, 2023 • 1.1 MB</div>
                  </div>
                  {activeVersion !== "V1" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveVersion("V1"); showToast("Restored Document Version 1 successfully!", { variant: "success" }); }}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-brand-500 hover:text-white transition"
                    >
                      <RotateCcw size={12} /> Rollback
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <button
                onClick={() => setShowVersionModal(false)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-200 transition focus:outline-none"
              >
                Close Version Console
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* FULL HISTORY LOGS MODAL */}
      {showHistoryModal && (
        <Modal onClose={() => setShowHistoryModal(false)} widthClass="max-w-[580px]">
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-[20px] font-bold text-slate-900">Document Activity Audit Trail</h2>
                <p className="mt-1 text-[13px] text-slate-500">Complete compliance logging for {fileName}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[380px] overflow-y-auto pr-2 scrollbar-thin space-y-6">
              {[
                [`Document uploaded to Order ${orderId}`, `${date} at 10:15 AM`, "blue", `System successfully processed initial upload payload. Secure MD5 verification: clean.`],
                ["Automated security check complete", `${date} at 10:16 AM`, "green", "Anti-virus & malware scanning completed (0 threats detected). Hash integrity matched."],
                ["Assigned to Escrow Officer", `${date} at 10:20 AM`, "blue", "Automated queue routed document to Senior Escrow Officer for compliance inspection."],
                [`Status changed to [${status}]`, `Oct 25, 2023 at 09:30 AM`, status === "Approved" ? "green" : status === "Rejected" ? "red" : "blue", `Compliance evaluation state updated to [${status}].`],
              ].map(([title, time, tone, desc], index) => (
                <div key={index} className="relative flex gap-4 text-left">
                  <div className="relative mt-1 flex flex-col items-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        tone === "green"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : tone === "red"
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-brand-50 text-brand-600 border border-brand-200"
                      }`}
                    >
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                    {index < 3 ? <div className="mt-2 h-12 w-px bg-[#E7ECF4]" /> : null}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-slate-800">{title}</div>
                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{time}</div>
                    <div className="text-[13px] text-slate-500 mt-1.5 bg-[#F8FAFC] p-3 rounded-lg border border-slate-50 leading-relaxed font-medium">
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="rounded-lg bg-slate-100 px-5 py-2.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-200 transition focus:outline-none"
              >
                Close Logs
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
