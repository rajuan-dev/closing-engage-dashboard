import { useEffect, useState } from "react";
import { Search, X, ShieldCheck, Circle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { ordersApi } from "../../api/orders";
import { usersApi } from "../../api/users";
import { StatusBadge } from "../common";
import type { NotaryUser, StatusKey } from "../../types";

export function AssignNotaryModal({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { orders, setOrders, notaries, setNotaries } = useAppContext();
  const [query, setQuery] = useState("");
  const [availableNotaries, setAvailableNotaries] = useState<NotaryUser[]>(notaries);
  const [selectedNotaryId, setSelectedNotaryId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMode, setAssignMode] = useState<"single" | "open">("single");
  
  const order = orders.find((o: any) => o[0] === orderId) || orders[0];
  const orderNum = order ? order[0] : "#ORD-90212";
  const orderLocation = order ? order[4].replace("\n", ", ") : "123 Maple St, Austin, TX";

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

        const currentAssignedName = order && order[3] !== "Unassigned" ? order[3] : "";
        const currentMode = currentAssignedName === "Open for All" ? "open" : "single";
        const currentAssigned = rows.find((notary) => notary.fullName === currentAssignedName);
        const firstAssignable = rows.find((notary) => notary.status !== "Inactive");
        setAssignMode(currentMode);
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
      `${notary.fullName} ${notary.serviceArea || ""} ${notary.specialty || ""} ${notary.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );

  const handleAssign = async () => {
    if (!orderId) {
      onClose();
      return;
    }
    const selectedNotary = availableNotaries.find((notary) => notary.id === selectedNotaryId);
    if (assignMode === "single" && !selectedNotary) {
      setError("Select a real notary user account before assigning.");
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
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900">Assign Notary</h2>
          <p className="text-[15px] text-slate-500">Select a notary for this order</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 transition">
          <X size={30} strokeWidth={1.5} />
        </button>
      </div>
      <div className="rounded-2xl bg-[#EEF3FA] p-5">
        <div className="grid grid-cols-[130px_1fr] gap-y-4 text-[16px]">
          <div className="font-semibold uppercase tracking-[0.08em] text-slate-500">Order ID</div>
          <div className="text-right font-semibold text-slate-800">{orderNum}</div>
          <div className="font-semibold uppercase tracking-[0.08em] text-slate-500">Location</div>
          <div className="text-right font-semibold text-slate-800">{orderLocation}</div>
        </div>
      </div>
      <div className="mt-7">
        <div className="rounded-2xl border border-[#E5EBF6] bg-white p-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setAssignMode("open")}
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                assignMode === "open" ? "border-brand-500 bg-brand-500 text-white" : "border-[#CBD5E1] text-transparent"
              }`}
            >
              <Circle size={12} fill="currentColor" />
            </button>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-slate-900">Open for all notaries</div>
              <div className="mt-1 text-[13px] leading-5 text-slate-500">
                Broadcast this order to every active notary. The first notary who accepts will be assigned automatically.
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-3">
            <button
              type="button"
              onClick={() => setAssignMode("single")}
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                assignMode === "single" ? "border-brand-500 bg-brand-500 text-white" : "border-[#CBD5E1] text-transparent"
              }`}
            >
              <Circle size={12} fill="currentColor" />
            </button>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-slate-900">Assign a specific notary</div>
              <div className="mt-1 text-[13px] leading-5 text-slate-500">
                Pick one notary below when you already know exactly who should handle this file.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <label className="flex h-11 items-center gap-3 rounded-xl bg-[#EEF3FA] px-4 text-slate-400">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or location..."
            disabled={assignMode === "open"}
            className="w-full border-0 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </label>
      </div>
      <div className="mt-8 space-y-10">
        {isLoading ? (
          <div className="rounded-2xl border border-[#E5EBF6] bg-white p-6 text-center text-[15px] font-semibold text-slate-500">
            Loading real notary accounts...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-[14px] font-semibold text-red-600">
            {error}
          </div>
        ) : assignMode === "open" ? (
          <div className="rounded-2xl border border-[#D9E7FF] bg-[#F5F9FF] p-5 text-[14px] font-semibold leading-6 text-brand-600">
            This order will be sent to every active notary notification inbox. Once one notary accepts it, everyone else will be blocked automatically.
          </div>
        ) : visibleNotaries.length === 0 ? (
          <div className="rounded-2xl border border-[#E5EBF6] bg-white p-6 text-center text-[15px] font-semibold text-slate-500">
            No active notary accounts found.
          </div>
        ) : visibleNotaries.map((notary) => {
          const isSelected = selectedNotaryId === notary.id;
          const meta = [notary.serviceArea || "Service area not provided", notary.specialty || "Notary Signing Agent"]
            .filter(Boolean)
            .join(" • ");
          const status = notary.verify ? "Verified" : notary.status;

          return (
            <button
              key={notary.id}
              onClick={() => setSelectedNotaryId(notary.id)}
              className="flex w-full items-center justify-between text-left focus:outline-none"
            >
              <div className="flex items-start gap-5">
                <span
                  className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                    isSelected ? "border-brand-500" : "border-[#D4DAE5]"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full transition-all ${isSelected ? "bg-brand-500" : "bg-transparent"}`} />
                </span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] font-semibold text-slate-800">{notary.fullName}</span>
                    <StatusBadge status={status as StatusKey} />
                  </div>
                  <div className="mt-1 text-[16px] text-slate-500">{meta}</div>
                  <div className="mt-1 text-[13px] font-medium text-slate-400">{notary.email}</div>
                </div>
              </div>
              <div className="rounded-full p-2 text-brand-500">
                <ShieldCheck size={18} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4">
        <button
          onClick={handleAssign}
          disabled={isLoading || isAssigning || (assignMode === "single" && !selectedNotaryId)}
          className="rounded-xl bg-brand-500 py-4 text-[16px] font-semibold text-white shadow-md hover:bg-brand-600 transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isAssigning ? "Saving..." : assignMode === "open" ? "Open for All" : "Assign Notary"}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl bg-[#E8EDF6] py-4 text-[16px] font-semibold text-slate-600 hover:bg-slate-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
