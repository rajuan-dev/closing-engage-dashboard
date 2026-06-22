import { useEffect, useRef, useState } from "react";
import { Check, Mail, FileText, Save, Loader2, KeyRound, Camera } from "lucide-react";
import { adminAuth } from "../api/auth";
import { Avatar, SectionCard, GhostButton, PrimaryButton, FormSection, NotificationRow } from "../components/common";
import { profileGradients } from "../data";
import { useToast } from "../components/Toast";
import { useAppContext } from "../context/AppContext";
import { prepareAvatarDataUrl } from "../utils/avatarImage";

export function SettingsPage() {
  const { showToast } = useToast();
  const { adminProfile, setAdminProfile } = useAppContext();

  const initialSecurity = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const initialNotifications = {
    emailNotifications: adminProfile.notifications?.email ?? true,
    orderUpdates: adminProfile.notifications?.orders ?? true,
    documentUpdates: adminProfile.notifications?.documents ?? false,
  };

  const [profileForm, setProfileForm] = useState(adminProfile);
  const [securityForm, setSecurityForm] = useState(initialSecurity);
  const [notificationForm, setNotificationForm] = useState(initialNotifications);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfileForm(adminProfile);
    setNotificationForm({
      emailNotifications: adminProfile.notifications?.email ?? true,
      orderUpdates: adminProfile.notifications?.orders ?? true,
      documentUpdates: adminProfile.notifications?.documents ?? false,
    });
  }, [adminProfile]);

  const profileInitials = profileForm.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateProfile = (field: keyof typeof adminProfile, value: string) =>
    setProfileForm((current) => ({ ...current, [field]: value }));
  const updateSecurity = (field: keyof typeof initialSecurity, value: string) =>
    setSecurityForm((current) => ({ ...current, [field]: value }));
  
  const toggleNotification = (field: keyof typeof initialNotifications) => {
    if (!isEditing) return;
    const newValue = !notificationForm[field];
    setNotificationForm((current) => ({ ...current, [field]: newValue }));
  };

  const handleReset = () => {
    setProfileForm(adminProfile);
    setSecurityForm(initialSecurity);
    setNotificationForm({
      emailNotifications: adminProfile.notifications?.email ?? true,
      orderUpdates: adminProfile.notifications?.orders ?? true,
      documentUpdates: adminProfile.notifications?.documents ?? false,
    });
    setIsEditing(false);
    showToast("Changes Discarded", { message: "Your settings have been reset to their original state.", variant: "info" });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!isEditing) {
      showToast("Edit Mode Required", {
        message: "Click Edit Profile before updating the admin profile photo.",
        variant: "info",
      });
      return;
    }

    try {
      const avatarUrl = await prepareAvatarDataUrl(file);
      setProfileForm((current) => ({ ...current, avatarUrl }));
    } catch (error) {
      showToast("Upload Failed", {
        message: error instanceof Error ? error.message : "Unable to process the selected image.",
        variant: "error",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile) return;
    setIsSavingProfile(true);

    try {
      const session = await adminAuth.updateProfile({
        ...profileForm,
        notifications: {
          email: notificationForm.emailNotifications,
          orders: notificationForm.orderUpdates,
          documents: notificationForm.documentUpdates,
        },
      });
      setAdminProfile(session.admin.profile);
      setIsSavingProfile(false);
      setIsEditing(false);
      showToast("Profile Updated", { message: "Your profile and company information have been saved successfully.", variant: "success" });
    } catch (error) {
      setIsSavingProfile(false);
      showToast("Update Failed", {
        message: error instanceof Error ? error.message : "Unable to save profile information.",
        variant: "error",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (isUpdatingPassword) return;
    
    if (!securityForm.currentPassword) {
      showToast("Validation Error", { message: "Please enter your current password.", variant: "error" });
      return;
    }
    if (securityForm.newPassword.length < 8) {
      showToast("Security Requirement", { message: "New password must be at least 8 characters long.", variant: "error" });
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast("Validation Error", { message: "New passwords do not match.", variant: "error" });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await adminAuth.updatePassword(
        securityForm.currentPassword,
        securityForm.newPassword,
        securityForm.confirmPassword,
      );
      setIsUpdatingPassword(false);
      setSecurityForm(initialSecurity); // Clear passwords
      showToast("Password Updated", { message: "Your security credentials have been successfully changed.", variant: "success" });
    } catch (error) {
      setIsUpdatingPassword(false);
      showToast("Update Failed", {
        message: error instanceof Error ? error.message : "Unable to update password.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard className="flex items-center justify-between px-5 py-5 border border-slate-100 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              className="h-[52px] w-[52px] rounded-xl"
              gradient={profileGradients.alex}
              src={profileForm.avatarUrl}
              alt={`${profileForm.fullName} avatar`}
              initials={profileInitials}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-brand-500 p-1 text-white shadow-md">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center focus:outline-none"
                >
                  <Camera size={10} strokeWidth={3} />
                </button>
              ) : (
                <Check size={10} strokeWidth={3} />
              )}
            </div>
          </div>
          <div>
            <div className="text-[18px] font-bold text-slate-900">{profileForm.fullName}</div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 font-semibold">
              <Mail size={13} />
              {profileForm.email}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-slate-500 font-semibold">
              <FileText size={13} />
              {profileForm.companyName}
            </div>
          </div>
        </div>
        <GhostButton 
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? "bg-slate-100 text-slate-700" : ""}
        >
          {isEditing ? "Cancel Edit" : "Edit Profile"}
        </GhostButton>
      </SectionCard>

      <div className="grid grid-cols-[1.85fr_0.9fr] gap-5">
        <div className="space-y-5">
          <FormSection title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <SettingsInput 
                label="Full Name" 
                value={profileForm.fullName} 
                onChange={(value) => updateProfile("fullName", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
              <SettingsInput 
                label="Email Address" 
                value={profileForm.email} 
                onChange={(value) => updateProfile("email", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
              <div className="col-span-2">
                <SettingsInput 
                  label="Phone Number" 
                  value={profileForm.phone} 
                  onChange={(value) => updateProfile("phone", value)} 
                  disabled={!isEditing || isSavingProfile} 
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Company Information">
            <div className="grid grid-cols-2 gap-4">
              <SettingsInput 
                label="Company Name" 
                value={profileForm.companyName} 
                onChange={(value) => updateProfile("companyName", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
              <SettingsInput 
                label="Company Email" 
                value={profileForm.companyEmail} 
                onChange={(value) => updateProfile("companyEmail", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
              <SettingsInput 
                label="Contact Number" 
                value={profileForm.contactNumber} 
                onChange={(value) => updateProfile("contactNumber", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
              <SettingsInput 
                label="Business Address" 
                value={profileForm.businessAddress} 
                onChange={(value) => updateProfile("businessAddress", value)} 
                disabled={!isEditing || isSavingProfile} 
              />
            </div>
          </FormSection>
        </div>

        <div className="space-y-5">
          <FormSection title="Security Settings">
            <div className="space-y-4">
              <SettingsInput
                label="Current Password"
                value={securityForm.currentPassword}
                onChange={(value) => updateSecurity("currentPassword", value)}
                type="password"
                placeholder="••••••••"
                disabled={isUpdatingPassword}
              />
              <SettingsInput
                label="New Password"
                value={securityForm.newPassword}
                onChange={(value) => updateSecurity("newPassword", value)}
                type="password"
                placeholder="••••••••"
                disabled={isUpdatingPassword}
              />
              <SettingsInput
                label="Confirm New Password"
                value={securityForm.confirmPassword}
                onChange={(value) => updateSecurity("confirmPassword", value)}
                type="password"
                placeholder="••••••••"
                disabled={isUpdatingPassword}
              />
              <GhostButton 
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword}
                className="w-full justify-center text-brand-500 hover:bg-brand-50 transition border-brand-500/20"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 size={15} className="mr-2 animate-spin" />
                    Updating Security...
                  </>
                ) : (
                  <>
                    <KeyRound size={15} className="mr-2" />
                    Update Password
                  </>
                )}
              </GhostButton>
            </div>
          </FormSection>

          <FormSection title="Notification Preferences">
            <div className="space-y-5">
              <NotificationRow
                title="Email Notifications"
                text="Receive global summary emails"
                checked={notificationForm.emailNotifications}
                onToggle={() => toggleNotification("emailNotifications")}
                disabled={!isEditing}
              />
              <NotificationRow
                title="Order Updates"
                text="Real-time alerts for escrow changes"
                checked={notificationForm.orderUpdates}
                onToggle={() => toggleNotification("orderUpdates")}
                disabled={!isEditing}
              />
              <NotificationRow
                title="Document Updates"
                text="Alerts when new documents are signed"
                checked={notificationForm.documentUpdates}
                onToggle={() => toggleNotification("documentUpdates")}
                disabled={!isEditing}
              />
            </div>
          </FormSection>
        </div>
      </div>

      <div className="border-t border-[#E7EAF1] pt-5">
        <div className="flex justify-end gap-3">
          <GhostButton onClick={handleReset} disabled={isSavingProfile}>Cancel</GhostButton>
          <PrimaryButton onClick={handleSaveProfile} disabled={isSavingProfile || !isEditing}>
            {isSavingProfile ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block transition-opacity duration-200 ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}>
      <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 w-full rounded-xl border border-[#DBE4F3] bg-[#F8FAFF] px-4 text-[14px] text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/20 disabled:pointer-events-none"
      />
    </label>
  );
}
