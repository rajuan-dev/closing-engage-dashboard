import { useRef, useState } from "react";
import { Link2, ShieldCheck, Camera } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { usersApi } from "../../api/users";
import { firstPasswordVault } from "../../utils/firstPasswordVault";
import { prepareAvatarDataUrl } from "../../utils/avatarImage";
import type { CompanyUser } from "../../types";
import { US_STATE_OPTIONS } from "../../constants/usStates";
import { Avatar } from "../common";
import {
  ModalHeader,
  ModalInput,
  ModalSelect,
  ModalSectionTitle,
  ModalCheckbox,
  ToggleOptionCard,
  ModalActionFooter,
} from "./Modal";
import { profileGradients } from "../../data";

export function AddCompanyUserModal({
  onClose,
  onSwitchType,
  companyToEdit,
  prefillData,
  requestId,
}: {
  onClose: () => void;
  onSwitchType: () => void;
  companyToEdit?: CompanyUser | null;
  prefillData?: Partial<CompanyUser> | null;
  requestId?: string | null;
}) {
  const { setCompanies, setRegistrationRequests } = useAppContext();
  const isEdit = !!companyToEdit;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    companyName: companyToEdit?.companyName || prefillData?.companyName || "",
    businessEmail: companyToEdit?.businessEmail || prefillData?.businessEmail || "",
    phone: companyToEdit?.phone || prefillData?.phone || "",
    contactPerson: companyToEdit?.contactPerson || prefillData?.contactPerson || "",
    address: companyToEdit?.address || prefillData?.address || "",
    state: companyToEdit?.state || prefillData?.state || "",
    contactEmail: companyToEdit?.contactEmail || prefillData?.contactEmail || "",
    userName: companyToEdit?.userName || prefillData?.userName || "",
    password: companyToEdit?.password || prefillData?.password || "",
    avatarUrl: companyToEdit?.avatarUrl || prefillData?.avatarUrl || "",
    sendInvite: companyToEdit?.sendInvite || prefillData?.sendInvite || false,
    active: companyToEdit ? companyToEdit.status !== "Inactive" : true,
    verify: companyToEdit ? !!companyToEdit.verify : (prefillData ? true : false),
  });
  const [error, setError] = useState("");
  const nextStatus: CompanyUser["status"] = form.active ? "Active" : "Inactive";
  const avatarInitials = (form.companyName || form.contactPerson || "CO")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const avatarUrl = await prepareAvatarDataUrl(file);
      updateField("avatarUrl", avatarUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to process the selected image.");
    }
  };

  const handleSubmit = async () => {
    if (
      !form.companyName ||
      !form.businessEmail ||
      !form.contactPerson ||
      !form.state ||
      !form.userName ||
      (!isEdit && !form.password)
    ) {
      setError("Complete all required fields before saving.");
      return;
    }

    const payload = {
      companyName: form.companyName,
      contactPerson: form.contactPerson,
      businessEmail: form.businessEmail,
      phone: form.phone,
      status: nextStatus,
      verify: form.verify,
      address: form.address,
      state: form.state,
      contactEmail: form.contactEmail,
      userName: form.userName,
      password: form.password,
      avatarUrl: form.avatarUrl,
      sendInvite: form.sendInvite,
    };

    try {
      if (isEdit && companyToEdit) {
        const updatedCompany = await usersApi.updateCompany(companyToEdit.id, payload);
        if (form.password) {
          firstPasswordVault.save(updatedCompany.id, {
            role: "company",
            password: form.password,
            userName: form.userName,
            email: form.contactEmail || form.businessEmail,
          });
        }
        setCompanies((prev) => prev.map((c) => (c.id === companyToEdit.id ? updatedCompany : c)));
      } else {
        const newCompany = await usersApi.createCompany(payload);
        firstPasswordVault.save(newCompany.id, {
          role: "company",
          password: form.password,
          userName: form.userName,
          email: form.contactEmail || form.businessEmail,
        });
        setCompanies((prev) => [newCompany, ...prev]);

        if (requestId) {
          const updatedRequest = await usersApi.updateAccessRequestStatus(requestId, "Approved");
          setRegistrationRequests((prev) => prev.map((r) => (r.id === requestId ? updatedRequest : r)));
        }
      }
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Failed to save company user.");
      return;
    }

    setError("");
    onClose();
  };

  return (
    <div className="flex flex-col max-h-[88vh]">
      <ModalHeader
        title={isEdit ? "Edit Company User" : "Add Title Company"}
        subtitle={isEdit ? "Update this title company user account details" : "Create a new user account"}
        onClose={onClose}
      />
      <div className="flex-1 overflow-y-auto space-y-7 px-5 py-5">
        {!isEdit && (
          <div>
            <div className="mb-3 text-[14px] font-semibold text-slate-600">User Type Selection</div>
            <div className="inline-flex rounded-xl bg-[#EDF1F7] p-1">
              <button className="rounded-lg bg-white px-5 py-2 text-[14px] font-semibold text-brand-500 shadow-sm">
                Title Company
              </button>
              <button onClick={onSwitchType} className="px-5 py-2 text-[14px] font-medium text-slate-500 hover:text-slate-700 transition">
                Notary
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <ModalInput
            label="Company Name"
            required
            placeholder="e.g. Acme Title Co."
            value={form.companyName}
            onChange={(value) => updateField("companyName", value)}
          />
          <ModalInput
            label="Business Email"
            required
            placeholder="contact@company.com"
            value={form.businessEmail}
            onChange={(value) => updateField("businessEmail", value)}
          />
          <ModalInput
            label="Phone"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
          />
          <ModalInput
            label="Contact Person Name"
            required
            placeholder="Full name"
            value={form.contactPerson}
            onChange={(value) => updateField("contactPerson", value)}
          />
          <div className="col-span-2">
            <ModalInput
              label="Address"
              placeholder="Street address, City, State, ZIP"
              value={form.address}
              onChange={(value) => updateField("address", value)}
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
          <div className="col-span-2">
            <ModalInput
              label="Contact Email"
              placeholder="person@company.com"
              value={form.contactEmail}
              onChange={(value) => updateField("contactEmail", value)}
            />
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
            title="Verify Company"
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

        <div>
          <ModalSectionTitle title="Company Profile Photo" />
          <div className="mt-5 flex items-center gap-5 rounded-[20px] border border-[#E7EDF6] bg-[#F9FBFF] px-5 py-4">
            <div className="relative">
              <Avatar
                className="h-[72px] w-[72px] rounded-[20px]"
                gradient={profileGradients.alex}
                src={form.avatarUrl}
                alt={`${form.companyName || "Company"} avatar`}
                initials={avatarInitials}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-brand-500 text-white shadow-[0_10px_18px_rgba(29,93,195,0.24)] transition hover:bg-brand-600"
              >
                <Camera size={14} />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-slate-700">Upload company profile photo</div>
              <div className="mt-1 text-[12px] text-slate-500">
                This image is saved to the existing backend profile and will appear in company detail views.
              </div>
              {form.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => updateField("avatarUrl", "")}
                  className="mt-3 text-[12px] font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  Remove Photo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <ModalActionFooter onClose={onClose} onConfirm={handleSubmit} confirmLabel={isEdit ? "Save Changes" : "Create User"} />
    </div>
  );
}
