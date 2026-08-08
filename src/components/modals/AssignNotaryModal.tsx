import { useEffect, useState } from "react";
import {
  Search,
  X,
  ShieldCheck,
  Circle,
  UserCheck,
  Radio,
  MapPin,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  Check,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { ordersApi } from "../../api/orders";
import { usersApi } from "../../api/users";
import { StatusBadge, Avatar } from "../common";
import { profileGradients } from "../../data";
import type { NotaryUser, StatusKey } from "../../types";

export function AssignNotaryModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { orders, setOrders, notaries, setNotaries } = useAppContext();
  const [query, setQuery] = useState("");
  const [availableNotaries, setAvailableNotaries] = useState<NotaryUser[]>(notaries);
  const [selectedNotaryId, setSelectedNotaryId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const order = orders.find((o: any) => o[0] === orderId) || orders[0];
  const orderNum = order ? order[0] : "#ORD-90212";
  const orderLocation = order ? order[4].replace("\n", ", ") : "123 Maple St, Austin, TX";
  const titleCompany = order && order[2] ? order[2] : "";

  const usStateCodesSet = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
    'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY'
  ]);
  const usStateNames: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  };

  const extractStateCode = (locationStr?: string): string => {
    if (!locationStr) return '';
    const segments = locationStr.split(',').map((segment) => segment.trim()).filter(Boolean);
    for (const segment of segments) {
      const upper = segment.toUpperCase();
      if (usStateCodesSet.has(upper)) return upper;
      if (Object.values(usStateNames).some((name) => name.toUpperCase() === upper)) {
        const foundEntry = Object.entries(usStateNames).find(([, name]) => name.toUpperCase() === upper);
        if (foundEntry) return foundEntry[0];
      }
    }
    for (let i = segments.length - 1; i >= 0; i--) {
      const parts = segments[i].split(/\s+/).map((part) => part.trim().toUpperCase()).filter(Boolean);
      for (let j = parts.length - 1; j >= 0; j--) {
        const part = parts[j];
        if (usStateCodesSet.has(part)) return part;
      }
    }
    return '';
  };

  const stateCode = extractStateCode(orderLocation);
  const stateName = usStateNames[stateCode] || stateCode;

  const initialMode: "single" | "open" = order && order[3] === "Open for All" ? "open" : "single";
  const [assignMode, setAssignMode] = useState<"single" | "open">(initialMode);

  useEffect(() => {
    if (order) {
      setAssignMode(order[3] === "Open for All" ? "open" : "single");
    }
  }, [orderId]);

  useEffect(() => {
    let isMounted = true;

    const loadNotaries = async () => {
      try {
        setIsLoading(true);
        setError("");
        const rows = await usersApi.getNotaries();
        if (!isMounted) return;

        setNotaries(rows);
        setAvailableNotaries(rows);

        const currentAssignedName = order && order[3] !== "Unassigned" && order[3] !== "--" ? order[3] : "";
        const currentAssigned = rows.find((notary) => notary.fullName === currentAssignedName);
        const firstAssignable = rows.find((notary) => notary.status !== "Inactive");
        setSelectedNotaryId(currentAssigned?.id || firstAssignable?.id || "");
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load notary users.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadNotaries();

    return () => {
      isMounted = false;
    };
  }, [order, setNotaries]);

  const visibleNotaries = availableNotaries
    .filter((notary) => notary.status !== "Inactive")
    .filter((notary) =>
      `${notary.fullName} ${notary.serviceArea || ""} ${notary.specialty || ""} ${notary.email} ${notary.phone || ""} ${notary.license || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  const selectedNotary = availableNotaries.find((n) => n.id === selectedNotaryId);

  const handleAssign = async () => {
    if (!orderId) {
      onClose();
      return;
    }
    if (assignMode === "single" && !selectedNotary) {
      setError("Select a valid notary user account before assigning.");
      return;
    }

    try {
      setIsAssigning(true);
      setError("");
      const updatedOrder = await ordersApi.assignNotary(
        orderId,
        assignMode === "open"
          ? { openForAll: true }
          : {
              notaryName: selectedNotary?.fullName,
              notaryId: selectedNotary?.id,
              notaryEmail: selectedNotary?.email,
            },
      );
      setOrders((prev: any) => prev.map((o: any) => (o[0] === orderId ? updatedOrder : o)));
      onClose();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Unable to assign notary.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] min-h-[540px] bg-white text-slate-800 overflow-hidden rounded-[24px]">
      <div className="flex-none p-6 pb-4 border-b border-slate-100 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <UserCheck size={18} />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Assign Notary</h2>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">
              Assign a specific notary or broadcast this order to all active signing agents.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 px-4 text-xs font-medium text-slate-600 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 text-[13px]">
              {orderNum}
            </span>
            {titleCompany && (
              <span className="text-slate-400">
                • <span className="text-slate-700 font-semibold">{titleCompany}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 max-w-[380px] truncate" title={orderLocation}>
            <MapPin size={14} className="text-slate-400 shrink-0" />
            <span className="truncate">{orderLocation}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAssignMode("single")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              assignMode === "single"
                ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500/30 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                assignMode === "single" ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 bg-white"
              }`}
            >
              {assignMode === "single" && <Circle size={7} fill="currentColor" />}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Assign Specific Notary</div>
              <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                Pick a verified notary agent from database
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAssignMode("open")}
            className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
              assignMode === "open"
                ? "border-brand-500 bg-brand-50/40 ring-1 ring-brand-500/30 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                assignMode === "open" ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 bg-white"
              }`}
            >
              {assignMode === "open" && <Circle size={7} fill="currentColor" />}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-slate-900">Open for All Notaries</div>
              <div className="text-[12px] text-slate-500 mt-0.5 leading-snug">
                Broadcast order to active signing agents in {stateName || "matching state"}
              </div>
            </div>
          </button>
        </div>
      </div>

      {assignMode === "single" && (
        <div className="flex-none px-6 py-3 border-b border-slate-100 bg-white flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, location, email, or specialty..."
              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-9 text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span className="text-[12px] font-semibold text-slate-500 whitespace-nowrap bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
            {visibleNotaries.length} {visibleNotaries.length === 1 ? "Notary" : "Notaries"}
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 animate-spin mb-3">
              <Loader2 size={20} />
            </div>
            <p className="text-[14px] font-medium text-slate-600">Loading active notary accounts...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[14px] text-red-700 flex items-start gap-3">
            <span className="font-semibold">Error:</span> {error}
          </div>
        ) : assignMode === "open" ? (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/70 to-blue-50/40 p-6 text-slate-700 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/30">
                <Radio size={24} className="animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-slate-900">
                  Broadcast Order to {stateName ? `${stateName} Notaries` : "Notaries in Matching State"}
                </h3>
                <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
                  When you submit this order in <strong>Open Broadcast Mode</strong>, it will immediately be dispatched to every active registered notary agent in {stateName || "the matching state"} on Closing Engage.
                </p>
                <ul className="mt-4 space-y-2 text-[13px] text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                    <span>Automated instant push notification and email broadcast to {stateName || "matching state"} notaries</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                    <span>First qualified notary in {stateName || "matching state"} to accept secures the assignment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-brand-500 shrink-0" />
                    <span>Order locks automatically once claimed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : visibleNotaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <Search size={22} />
            </div>
            <h4 className="text-[15px] font-semibold text-slate-800">No notary accounts found</h4>
            <p className="mt-1 text-[13px] text-slate-500">
              {query ? `No active notaries matched "${query}". Try searching for something else.` : "No active notary accounts available."}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-brand-700"
              >
                <X size={14} /> Clear search filter
              </button>
            )}
          </div>
        ) : (
          visibleNotaries.map((notary) => {
            const isSelected = selectedNotaryId === notary.id;
            const initials = notary.initials || notary.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            const avatarGradient = notary.fullName.toLowerCase().includes("sarah") || notary.fullName.toLowerCase().includes("jane")
              ? profileGradients.jane
              : notary.fullName.toLowerCase().includes("mark") || notary.fullName.toLowerCase().includes("james")
              ? profileGradients.mark
              : profileGradients.alex;

            return (
              <div
                key={notary.id}
                onClick={() => setSelectedNotaryId(notary.id)}
                className={`group relative rounded-xl border p-4 transition-all duration-150 cursor-pointer flex items-start justify-between gap-4 ${
                  isSelected
                    ? "border-brand-500 bg-white shadow-md ring-2 ring-brand-500/20"
                    : "border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="mt-1 shrink-0">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        isSelected ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300 group-hover:border-slate-400 bg-white"
                      }`}
                    >
                      {isSelected && <Circle size={7} fill="currentColor" />}
                    </span>
                  </div>

                  <Avatar
                    className="h-11 w-11 shrink-0 rounded-full text-white font-bold"
                    gradient={avatarGradient}
                    src={notary.avatarUrl}
                    initials={initials}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[15px] font-bold text-slate-900 group-hover:text-brand-600 transition">
                        {notary.fullName}
                      </span>
                      {notary.verify ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 border border-blue-100">
                          <ShieldCheck size={12} className="text-blue-500" />
                          Verified Notary
                        </span>
                      ) : (
                        <StatusBadge status={notary.status as StatusKey} />
                      )}
                      {notary.license && (
                        <span className="text-[11px] font-mono text-slate-400">
                          Lic #{notary.license}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[13px] font-medium text-slate-600 flex-wrap">
                      <span className="text-slate-800 font-semibold">{notary.specialty || "Mobile Loan Signing Agent"}</span>
                      {notary.serviceArea && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {notary.serviceArea}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-4 text-[12px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 truncate">
                        <Mail size={12} className="shrink-0 text-slate-400" />
                        {notary.email}
                      </span>
                      {notary.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="shrink-0 text-slate-400" />
                          {notary.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-0.5">
                  {isSelected ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 group-hover:text-slate-400 transition">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex-none p-4 px-6 border-t border-slate-200/80 bg-slate-50/90 backdrop-blur flex items-center justify-between gap-4">
        <div className="text-[13px] font-medium text-slate-600 truncate max-w-[280px]">
          {assignMode === "open" ? (
            <span className="text-brand-600 font-semibold flex items-center gap-1.5">
              <Radio size={14} /> Open Broadcast Mode
            </span>
          ) : selectedNotary ? (
            <span>
              Selected: <strong className="text-slate-900">{selectedNotary.fullName}</strong>
            </span>
          ) : (
            <span className="text-amber-600">Please select a notary to assign</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isLoading || isAssigning || (assignMode === "single" && !selectedNotaryId)}
            className="h-10 px-6 rounded-xl bg-brand-500 text-[14px] font-semibold text-white shadow-md hover:bg-brand-600 hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAssigning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : assignMode === "open" ? (
              <>
                <Radio size={16} />
                Broadcast to {stateName ? `${stateName} Notaries` : "Matching Notaries"}
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Assign Notary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
