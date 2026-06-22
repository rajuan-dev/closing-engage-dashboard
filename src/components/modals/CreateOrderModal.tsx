import { useMemo, useState } from "react";
import { MapPin, Calendar, UserPlus, ShieldCheck, FileText } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { ordersApi } from "../../api/orders";
import { Avatar } from "../common";
import { profileGradients } from "../../data";

// Helper functions to convert date formats between MM/DD/YYYY and YYYY-MM-DD
const convertToInputDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const parts = dateStr.split("/");
  if (parts.length === 3) {
    let [month, day, year] = parts;
    if (month.length === 1) month = "0" + month;
    if (day.length === 1) day = "0" + day;
    if (year.length === 2) year = "20" + year;
    return `${year}-${month}-${day}`;
  }
  return "";
};

const convertToDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  }
  return dateStr;
};
import { ModalHeader, ModalInput, ModalActionFooter } from "./Modal";
import { SectionCard } from "../common";

export function CreateOrderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: () => void;
}) {
  const { setOrders, orders, notaries } = useAppContext();
  const [form, setForm] = useState({
    titleCompany: "Grand Peak Title",
    propertyAddress: "452 Pine St, San Francisco, CA 94104",
    signerName: "Daniel Brooks",
    signerPhone: "(555) 401-8291",
    signingDate: convertToInputDate("10/24/2024"),
    signingTime: "2:00 PM",
    status: "Received",
    priority: "Standard",
    notaryPreference: "First available",
    instructions:
      "Please ensure all signatures are in blue ink. Borrower requires a physical copy of the closing disclosure. Verify ID against provided scanbacks meticulously.",
  });
  const [documents, setDocuments] = useState([
    { name: "Closing_Package.pdf", meta: "4.2 MB • Uploaded 2h ago" },
    { name: "Instructions_Sheet.pdf", meta: "1.1 MB • Uploaded 2h ago" },
  ]);
  const [error, setError] = useState("");

  const gradientForName = (name: string) => {
    const normalized = name.toLowerCase();
    if (normalized.includes("sarah") || normalized.includes("jane")) return profileGradients.jane;
    if (normalized.includes("mark") || normalized.includes("robert")) return profileGradients.mark;
    return profileGradients.alex;
  };

  const suggestedNotary = useMemo(() => {
    const companyOrders = orders.filter((order) => order[1] === form.titleCompany);
    const completedAssignments = companyOrders.filter((order) => {
      const notaryName = order[3];
      return notaryName && notaryName !== "Unassigned" && notaryName !== "Open for All";
    });

    if (completedAssignments.length === 0) {
      return null;
    }

    const counts = new Map<string, number>();
    completedAssignments.forEach((order) => {
      const name = order[3].trim().toLowerCase();
      counts.set(name, (counts.get(name) || 0) + 1);
    });

    const topName = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0];
    if (!topName) {
      return null;
    }

    const notary = notaries.find((entry) => entry.fullName.trim().toLowerCase() === topName);
    const historicalOrderCount = counts.get(topName) || 0;

    return {
      notary,
      historicalOrderCount,
      displayName: notary?.fullName || completedAssignments.find((order) => order[3].trim().toLowerCase() === topName)?.[3] || "Suggested Notary",
      serviceArea: notary?.serviceArea || "Previously assigned to this title company",
      specialty: notary?.specialty || "Trusted prior signing partner",
    };
  }, [form.titleCompany, notaries, orders]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addDocument = () => {
    setDocuments((current) => [
      ...current,
      {
        name: `Supporting_Doc_${current.length + 1}.pdf`,
        meta: "980 KB • Added just now",
      },
    ]);
  };

  const handleCreate = async () => {
    if (!form.titleCompany || !form.propertyAddress || !form.signingDate || !form.signingTime) {
      setError("Complete the required order information before creating the order.");
      return;
    }

    try {
      const newOrder = await ordersApi.createOrder({
        ...form,
        signingDate: convertToDisplayDate(form.signingDate),
        status: form.status as "Received" | "Assigned" | "Under Review",
        priority: form.priority as "Standard" | "Rush" | "High Touch",
        notaryPreference: form.notaryPreference as "First available" | "Verified only" | "Manual assignment",
        documents,
      });
      setOrders((prev: any) => [newOrder, ...prev]);
      setError("");
      onCreate();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create order.");
    }
  };

  const statusOptions = ["Received", "Assigned", "Under Review"];
  const priorityOptions = ["Standard", "Rush", "High Touch"];
  const notaryOptions = ["First available", "Verified only", "Manual assignment"];

  return (
    <div className="flex max-h-[88vh] flex-col overflow-hidden">
      <ModalHeader
        title="Create Order"
        subtitle="Set up a new closing order and assign the required details."
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-[26px] border border-[#E6ECF7] bg-[linear-gradient(180deg,#F8FBFF_0%,#F2F7FF_100%)] p-5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-500">Order Setup</div>
                <div className="mt-2 text-[24px] font-bold tracking-[-0.03em] text-slate-900">Prepare a new closing file</div>
                <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-slate-500">
                  Capture the property, signer, schedule, and routing requirements now so the order can move directly into
                  assignment and document review.
                </p>
              </div>
              <div className="grid min-w-[250px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Current Status</div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-800">{form.status}</div>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Priority</div>
                  <div className="mt-2 text-[15px] font-semibold text-slate-800">{form.priority}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1.45fr_0.92fr] gap-5">
            <div className="space-y-5">
              <SectionCard className="p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF5FF] text-brand-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">Order Information</div>
                    <div className="text-[13px] text-slate-500">Core property and signing details for this closing.</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ModalInput
                    label="Title Company"
                    placeholder="Grand Peak Title"
                    value={form.titleCompany}
                    onChange={(value) => updateField("titleCompany", value)}
                  />
                  <div>
                    <div className="mb-2 text-[13px] font-semibold text-slate-600">Order Status</div>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField("status", option)}
                          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                            form.status === option ? "bg-brand-500 text-white" : "bg-[#EEF3FA] text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <ModalInput
                      label="Property Address"
                      placeholder="Street, City, State, ZIP"
                      value={form.propertyAddress}
                      onChange={(value) => updateField("propertyAddress", value)}
                      icon={<MapPin size={16} className="text-slate-500" />}
                    />
                  </div>
                  <ModalInput
                    label="Signing Date"
                    placeholder="Select Date"
                    type="date"
                    value={form.signingDate}
                    onChange={(value) => updateField("signingDate", value)}
                    icon={<Calendar size={16} className="text-slate-500" />}
                  />
                  <ModalInput
                    label="Signing Time"
                    placeholder="2:00 PM"
                    value={form.signingTime}
                    onChange={(value) => updateField("signingTime", value)}
                  />
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF9F0] text-[#2F9E54]">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">Signer Details</div>
                    <div className="text-[13px] text-slate-500">Primary signer contact information used during scheduling.</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ModalInput
                    label="Signer Name"
                    placeholder="Full legal name"
                    value={form.signerName}
                    onChange={(value) => updateField("signerName", value)}
                  />
                  <ModalInput
                    label="Phone Number"
                    placeholder="(555) 000-0000"
                    value={form.signerPhone}
                    onChange={(value) => updateField("signerPhone", value)}
                  />
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">Special Instructions</div>
                    <div className="text-[13px] text-slate-500">Leave precise handling notes for the assigned notary and reviewers.</div>
                  </div>
                </div>
                <textarea
                  value={form.instructions}
                  onChange={(event) => updateField("instructions", event.target.value)}
                  className="min-h-[132px] w-full rounded-2xl border border-[#E1E7F0] bg-[#F5F8FC] px-4 py-4 text-[14px] leading-6 text-slate-700 outline-none focus:border-brand-500 transition"
                />
              </SectionCard>
            </div>

            <div className="space-y-5">
              <SectionCard className="p-5">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF4E8] text-[#D4882F]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">Assignment Settings</div>
                    <div className="text-[13px] text-slate-500">Define how this order should be routed once created.</div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="mb-2 text-[13px] font-semibold text-slate-600">Priority</div>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField("priority", option)}
                          className={`rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                            form.priority === option ? "bg-brand-500 text-white" : "bg-[#EEF3FA] text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[13px] font-semibold text-slate-600">Notary Preference</div>
                    <div className="space-y-2">
                      {notaryOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => updateField("notaryPreference", option)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left focus:outline-none transition ${
                            form.notaryPreference === option ? "border-[#B8CEF7] bg-[#F5F9FF]" : "border-[#E5EBF6] bg-white hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-[14px] font-medium text-slate-700">{option}</span>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                              form.notaryPreference === option ? "border-brand-500" : "border-[#D4DAE5]"
                            }`}
                          >
                            <span
                              className={`h-2.5 w-2.5 rounded-full transition-all ${
                                form.notaryPreference === option ? "bg-brand-500" : "bg-transparent"
                              }`}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#DCE5F2] bg-[#F8FBFF] p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      Preferred Notary (Optional)
                    </div>
                    {suggestedNotary ? (
                      <div className="mt-3 flex items-start gap-3">
                        <Avatar
                          className="h-12 w-12 rounded-[14px]"
                          gradient={gradientForName(suggestedNotary.displayName)}
                          src={suggestedNotary.notary?.avatarUrl}
                          alt={`${suggestedNotary.displayName} avatar`}
                          initials={suggestedNotary.notary?.initials || suggestedNotary.displayName.slice(0, 2).toUpperCase()}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-[15px] font-semibold text-slate-900">{suggestedNotary.displayName}</div>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                              Suggested
                            </span>
                          </div>
                          <div className="mt-1 text-[13px] text-slate-500">{suggestedNotary.specialty}</div>
                          <div className="mt-1 text-[12px] font-medium text-slate-400">
                            {suggestedNotary.serviceArea}
                          </div>
                          <div className="mt-2 text-[12px] font-semibold text-brand-600">
                            Worked on {suggestedNotary.historicalOrderCount} previous order{suggestedNotary.historicalOrderCount === 1 ? "" : "s"} for this company
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-dashed border-[#D5E2F7] bg-white px-4 py-4 text-[13px] leading-6 text-slate-500">
                        A suggested notary will appear here after the company has prior assignment history.
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#F5F8FC] px-4 py-4">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">Ready to Assign</div>
                    <div className="mt-2 text-[15px] font-semibold text-slate-800">This order can move directly into assignment.</div>
                    <div className="mt-1 text-[13px] leading-6 text-slate-500">
                      After creation, use the assign modal to choose the most suitable notary for this file.
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-[16px] font-semibold text-slate-900">Title Documents</div>
                    <div className="text-[13px] text-slate-500">Attach the base package and supporting instructions.</div>
                  </div>
                  <button onClick={addDocument} className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 transition">
                    Add Documents
                  </button>
                </div>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.name} className="flex items-center gap-4 rounded-2xl border border-[#F0F3F8] px-3 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0EF] text-[#EB5B53]">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{doc.name}</div>
                        <div className="text-[13px] text-slate-500">{doc.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-[#FFD9D7] bg-[#FFF5F4] px-4 py-3 text-[14px] text-[#C84B45]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
      <ModalActionFooter onClose={onClose} onConfirm={handleCreate} confirmLabel="Create Order" />
    </div>
  );
}
