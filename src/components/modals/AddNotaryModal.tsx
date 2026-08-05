import { useState } from "react";
import { Calendar, MapPin, Link2, ShieldCheck } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { usersApi } from "../../api/users";
import { firstPasswordVault } from "../../utils/firstPasswordVault";
import type { NotaryUser } from "../../types";
import { US_STATE_OPTIONS } from "../../constants/usStates";

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

import {
  ModalHeader,
  ModalInput,
  ModalSelect,
  ModalSectionTitle,
  ModalCheckbox,
  ToggleOptionCard,
  ModalActionFooter,
} from "./Modal";

export function AddNotaryModal({
  onClose,
  onSwitchType,
  notaryToEdit,
  prefillData,
  requestId,
}: {
  onClose: () => void;
  onSwitchType?: () => void;
  notaryToEdit?: NotaryUser | null;
  prefillData?: Partial<NotaryUser> | null;
  requestId?: string | null;
}) {
  const { setNotaries, setRegistrationRequests } = useAppContext();
  const isEdit = !!notaryToEdit;

  const [form, setForm] = useState({
    fullName: notaryToEdit?.fullName || prefillData?.fullName || "",
    email: notaryToEdit?.email || prefillData?.email || "",
    phone: notaryToEdit?.phone || prefillData?.phone || "",
    license: notaryToEdit?.license || prefillData?.license || "",
    expiry: convertToInputDate(notaryToEdit?.expiry || prefillData?.expiry || ""),
    serviceArea: notaryToEdit?.serviceArea || prefillData?.serviceArea || "",
    state: notaryToEdit?.state || prefillData?.state || "",
    userName: notaryToEdit?.userName || prefillData?.userName || "",
    password: notaryToEdit?.password || prefillData?.password || "",
    sendInvite: notaryToEdit?.sendInvite || prefillData?.sendInvite || false,
    active: notaryToEdit ? notaryToEdit.status !== "Inactive" : true,
    verify: notaryToEdit ? !!notaryToEdit.verify : (prefillData ? true : false),
  });
  const [error, setError] = useState("");
  const nextStatus: NotaryUser["status"] = form.active ? "Active" : "Inactive";

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.state ||
      !form.userName ||
      (!isEdit && !form.password)
    ) {
      setError("Complete all required fields before saving.");
      return;
    }

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      license: form.license,
      expiry: convertToDisplayDate(form.expiry),
      serviceArea: form.serviceArea,
      state: form.state,
      userName: form.userName,
      password: form.password,
      sendInvite: form.sendInvite,
      status: nextStatus,
      verify: form.verify,
      specialty: "Mobile Loan Signing Agent",
    };

    try {
      if (isEdit && notaryToEdit) {
        const updatedNotary = await usersApi.updateNotary(notaryToEdit.id, payload);
        if (form.password) {
          firstPasswordVault.save(updatedNotary.id, {
            role: "notary",
            password: form.password,
            userName: form.userName,
            email: form.email,
          });
        }
        setNotaries((prev) => prev.map((n) => (n.id === notaryToEdit.id ? updatedNotary : n)));
      } else {
        const newNotary = await usersApi.createNotary(payload);
        firstPasswordVault.save(newNotary.id, {
          role: "notary",
          password: form.password,
          userName: form.userName,
          email: form.email,
        });
        setNotaries((prev) => [newNotary, ...prev]);

        if (requestId) {
          const updatedRequest = await usersApi.updateAccessRequestStatus(requestId, "Approved");
          setRegistrationRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
        }
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Failed to save notary user.");
      return;
    }

    setError("");
    onClose();
  };

  return (
    <div className="flex flex-col max-h-[88vh]">
      <ModalHeader
        title={isEdit ? "Edit Notary User" : "Add Notary"}
        subtitle={isEdit ? "Update this notary user account details" : "Create a new notary account"}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto space-y-7 px-5 py-5">
        {!isEdit && (
          <div>
            <div className="mb-3 text-[14px] font-semibold text-slate-600">User Type Selection</div>
            <div className="inline-flex rounded-xl bg-[#EDF1F7] p-1">
              <button
                onClick={onSwitchType}
                className="px-5 py-2 text-[14px] font-medium text-slate-500 hover:text-slate-700 transition"
              >
                Title Company
              </button>
              <button className="rounded-lg bg-white px-5 py-2 text-[14px] font-semibold text-brand-500 shadow-sm">
                Notary
              </button>
            </div>
          </div>
        )}

        <div>
          <ModalSectionTitle title="Personal Information" />
          <div className="mt-5 grid grid-cols-2 gap-5">
            <ModalInput
              label="Full Name"
              required
              placeholder="e.g. Jane Doe"
              value={form.fullName}
              onChange={(value) => updateField("fullName", value)}
            />
            <ModalInput
              label="Email Address"
              required
              placeholder="jane.doe@example.com"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />
            <div className="col-span-2">
              <ModalInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
              />
            </div>
          </div>
        </div>

        <div>
          <ModalSectionTitle title="Professional Details" />
          <div className="mt-5 grid grid-cols-2 gap-5">
            <ModalInput
              label="License Number"
              placeholder="LIC-99882211"
              value={form.license}
              onChange={(value) => updateField("license", value)}
            />
            <ModalInput
              label="Commission Expiry Date"
              placeholder="Select Date"
              type="date"
              value={form.expiry}
              onChange={(value) => updateField("expiry", value)}
              icon={<Calendar size={16} className="text-slate-500" />}
            />
            <div className="col-span-2">
              <ModalInput
                label="Service Area / Location"
                placeholder="City, State or County"
                value={form.serviceArea}
                onChange={(value) => updateField("serviceArea", value)}
                icon={<MapPin size={16} className="text-slate-500" />}
              />
            </div>
            <div className="col-span-2">
              <ModalSelect
                label="State"
                required
                value={form.state}
                onChange={(value) => updateField("state", value)}
                options={US_STATE_OPTIONS}
                placeholder="Select State"
              />
            </div>
          </div>
        </div>

        <div>
          <ModalSectionTitle title="Account Setup" />
          <div className="mt-5 grid grid-cols-2 gap-5">
            <ModalInput
              label="User Name"
              required
              placeholder="Create username"
              value={form.userName}
              onChange={(value) => updateField("userName", value)}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-slate-600">
                  Password Setup{!isEdit ? <span className="ml-1 text-rose-500">*</span> : null}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const generated = Math.random().toString(36).substring(2, 10).toUpperCase() + Math.floor(100 + Math.random() * 900);
                    updateField("password", generated);
                  }}
                  className="text-[11px] font-extrabold text-brand-500 hover:text-brand-600 uppercase tracking-wider cursor-pointer"
                >
                  Generate Password
                </button>
              </div>
              <div className="flex h-11 items-center gap-3 rounded-lg border border-[#E1E7F0] bg-[#F5F8FC] px-4">
                <input
                  type="text"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="••••••••"
                  className="w-full border-0 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>
          </div>
          <ModalCheckbox
            checked={form.sendInvite}
            onToggle={() => updateField("sendInvite", !form.sendInvite)}
            label="Send invitation email to this user"
            className="mt-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <ToggleOptionCard
            title="Status"
            subtitle={form.active ? "Active" : "Inactive"}
            checked={form.active}
            onToggle={() => updateField("active", !form.active)}
            icon={<Link2 size={16} />}
            activeColor="text-emerald-600"
          />
          <ToggleOptionCard
            title="Verify Notary"
            subtitle={form.verify ? "Verified" : "Pending Verification"}
            checked={form.verify}
            onToggle={() => updateField("verify", !form.verify)}
            icon={<ShieldCheck size={16} />}
            activeColor="text-brand-500"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-[#FFD9D7] bg-[#FFF5F4] px-4 py-3 text-[14px] text-[#C84B45]">
            {error}
          </div>
        ) : null}
      </div>
      <ModalActionFooter onClose={onClose} onConfirm={handleSubmit} confirmLabel={isEdit ? "Save Changes" : "Create User"} />
    </div>
  );
}
