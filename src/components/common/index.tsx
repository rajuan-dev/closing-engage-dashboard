import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { statusConfig } from "../../data";
import type { StatusKey } from "../../types";

export function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,214,0.22)] hover:bg-brand-600 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-3 text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

// Avatar
export function Avatar({
  className,
  gradient,
  src,
  alt = "Avatar",
  initials,
}: {
  className: string;
  gradient: string;
  src?: string;
  alt?: string;
  initials?: string;
}) {
  return (
    <div className={`${className} overflow-hidden border border-white/50 shadow-sm ${gradient}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : initials ? (
        <div className="flex h-full w-full items-center justify-center text-[12px] font-bold text-white">
          {initials}
        </div>
      ) : null}
    </div>
  );
}

// Switch & Toggles
export function Switch({ checked }: { checked: boolean }) {
  return (
    <div className={`relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-brand-500" : "bg-[#D9E1EE]"}`}>
      <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`} />
    </div>
  );
}

// Cards
export function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function IconBadge({ tone, children, large = false }: { tone: string; children: ReactNode; large?: boolean }) {
  const toneClass =
    tone === "blue"
      ? "bg-[#EEF5FF] text-brand-500"
      : tone === "green"
        ? "bg-[#EEF9F0] text-[#30A35A]"
        : tone === "amber"
          ? "bg-[#FFF1E6] text-[#D68A42]"
          : tone === "blue2"
            ? "bg-[#F2F7FF] text-[#3B82F6]"
            : "bg-[#EFF3F8] text-slate-500";
  return <div className={`flex items-center justify-center rounded-2xl ${large ? "h-14 w-14" : "h-12 w-12"} ${toneClass}`}>{children}</div>;
}

export function SimpleStatCard({
  title,
  value,
  note,
  icon,
  progress,
}: {
  title: string;
  value: string;
  note: string;
  icon: "building" | "shield" | "folder" | "approval" | "cloud";
  progress?: number;
}) {
  const tone = icon === "approval" ? "amber" : icon === "shield" ? "green" : "blue";
  return (
    <SectionCard className="p-4">
      <div className="mb-3.5 flex items-start justify-between">
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</div>
        <IconBadge tone={tone}><FileText size={18} /></IconBadge>
      </div>
      <div className="text-[18px] font-bold text-slate-900 leading-none">{value}</div>
      {progress ? (
        <div className="mt-3.5 h-1.5 w-24 rounded-full bg-[#E5EAF2]">
          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
      ) : (
        <div className={`mt-2 text-[12px] font-semibold ${note.includes("+") ? "text-[#38A868]" : "text-brand-500"}`}>{note}</div>
      )}
    </SectionCard>
  );
}

export function MetricPanel({
  title,
  value,
  note,
  tone = "slate",
  icon: Icon,
}: {
  title: string;
  value: string;
  note?: string;
  tone?: "blue" | "green" | "amber" | "slate";
  icon: any; // Using any for icon component typing compatibility
}) {
  const iconBg =
    tone === "blue"
      ? "bg-[#EEF5FF] text-[#3165CF]"
      : tone === "amber"
      ? "bg-[#FFF8EE] text-[#D4882F]"
      : tone === "green"
      ? "bg-[#ECFDF5] text-[#059669]"
      : "bg-[#F0F3F8] text-[#64748B]";

  return (
    <div className="metric-card-hover rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between h-[108px]">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={17} strokeWidth={1.8} />
        </div>
        {note && (
          note === "Alert" ? (
            <span className="flex items-center gap-1.5 rounded-full bg-[#FFF4E8] px-2.5 py-0.5 text-[11px] font-bold text-[#D4882F]">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[#D4882F]" />
              {note}
            </span>
          ) : (
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              tone === "amber" ? "bg-[#FFF4E8] text-[#D4882F]" 
              : tone === "green" ? "bg-[#ECFDF5] text-[#059669]" 
              : "bg-[#ECFDF5] text-[#059669]"
            }`}>
              {note}
            </span>
          )
        )}
      </div>
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{title}</div>
        <div className="mt-1 text-[20px] font-extrabold text-slate-900 leading-none">{value}</div>
      </div>
    </div>
  );
}

export function SmallMetricCard({ title, value, tone }: { title: string; value: string; tone: "blue" | "blue2" | "green"; }) {
  return (
    <SectionCard className="flex items-center gap-4 p-5">
      <IconBadge tone={tone}><FileText size={18} /></IconBadge>
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</div>
        <div className={`mt-1 text-[18px] font-bold ${tone === "green" ? "text-[#2E9F54]" : tone === "blue2" ? "text-[#2381FF]" : "text-slate-900"}`}>{value}</div>
      </div>
    </SectionCard>
  );
}

export function SnapshotItem({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3 border border-slate-100">
      <div className="text-slate-400">{icon}</div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</div>
        <div className="text-[14px] font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export function StatusTile({ label, value, tone }: { label: string; value: string; tone: "blue" | "green" | "amber" }) {
  const bg = tone === "blue" ? "bg-[#eef4ff] text-[#1e40af]" : tone === "green" ? "bg-[#ecfdf5] text-[#065f46]" : "bg-[#fffbeb] text-[#92400e]";
  return (
    <div className={`rounded-2xl px-4 py-3 ${bg}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] opacity-80">{label}</div>
      <div className="mt-1 text-[15px] font-bold">{value}</div>
    </div>
  );
}

// Table Helpers
export function StatusBadge({ status }: { status: StatusKey }) {
  return <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusConfig[status]}`}>{status}</span>;
}

export function TableHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <h3 className="text-[18px] font-semibold text-slate-800">{title}</h3>
      <button
        onClick={onAction}
        className="text-[13px] font-semibold text-brand-500 hover:text-brand-600 transition"
      >
        {action}
      </button>
    </div>
  );
}

export function Pagination({
  footer,
  pages,
  currentPage = 1,
  onPageChange,
  onPrevious,
  onNext,
  withPrevious = false,
}: {
  footer: string;
  pages: string[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  withPrevious?: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-[#EEF3FA] px-4 py-3 text-[13px] text-slate-500">
      <div>{footer}</div>
      <div className="flex items-center gap-2">
        {withPrevious ? (
          <button
            onClick={onPrevious}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} /> Previous
          </button>
        ) : (
          <ChevronLeft size={14} className="text-slate-400" />
        )}
        {pages.map((p, index) => {
          const pageNum = parseInt(p);
          const isActive = pageNum === currentPage;
          return (
            <button
              key={`${p}-${index}`}
              onClick={() => !isNaN(pageNum) && onPageChange?.(pageNum)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-[13px] transition ${
                isActive ? "bg-brand-500 text-white font-semibold" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          );
        })}
        {withPrevious ? (
          <button
            onClick={onNext}
            disabled={currentPage === pages.length || (pages.length > 0 && currentPage === parseInt(pages[pages.length - 1]))}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <ChevronRight size={14} className="text-slate-500" />
        )}
      </div>
    </div>
  );
}

// Form Helpers
export function SettingsInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-700 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-1 focus:ring-brand-500/10"
      />
    </label>
  );
}

export function SettingsToggle({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <div className="text-[14px] font-semibold text-slate-800">{label}</div>
        <div className="mt-0.5 text-[12px] text-slate-400 leading-normal">{description}</div>
      </div>
      <button type="button" onClick={onToggle} className="focus:outline-none">
        <Switch checked={checked} />
      </button>
    </div>
  );
}

export function PreferencePill({ label, active }: { label: string; active: boolean }) {
  const classes = active ? "bg-[#eef5ff] border-brand-200 text-brand-600 font-semibold" : "bg-white border-slate-200 text-slate-600";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[12px] transition ${classes}`}>{label}</span>;
}

export function UsersTabs({
  active,
  onCompanies,
  onNotaries,
  onRequests,
  companyCount,
  notaryCount,
  requestCount,
}: {
  active: "companies" | "notaries" | "requests";
  onCompanies: () => void;
  onNotaries: () => void;
  onRequests: () => void;
  companyCount: string;
  notaryCount: string;
  requestCount: string;
}) {
  return (
    <div className="border-b border-[#E7EAF1]">
      <div className="flex gap-8">
        <button
          onClick={onCompanies}
          className={`relative pb-4 text-[14px] font-semibold transition ${active === "companies" ? "text-brand-500" : "text-slate-500 hover:text-slate-700"}`}
        >
          Title Companies{" "}
          <span className="ml-2 rounded-full bg-[#EEF3FA] px-2 py-0.5 text-[10px] text-slate-500">
            {companyCount}
          </span>
          {active === "companies" ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500" /> : null}
        </button>
        <button
          onClick={onNotaries}
          className={`relative pb-4 text-[14px] font-semibold transition ${active === "notaries" ? "text-brand-500" : "text-slate-500 hover:text-slate-700"}`}
        >
          Notaries{" "}
          <span className="ml-2 rounded-full bg-[#EEF3FA] px-2 py-0.5 text-[10px] text-slate-500">
            {notaryCount}
          </span>
          {active === "notaries" ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500" /> : null}
        </button>
        {/* 
        <button
          onClick={onRequests}
          className={`relative pb-4 text-[14px] font-semibold transition ${active === "requests" ? "text-brand-500" : "text-slate-500 hover:text-slate-700"}`}
        >
          Access Requests{" "}
          <span className="ml-2 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-600 border border-amber-200/50 animate-pulse">
            {requestCount}
          </span>
          {active === "requests" ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-500" /> : null}
        </button>
        */}
      </div>
    </div>
  );
}

export function DropdownField({
  label,
  options = [],
  onSelect = () => {},
  icon,
  widthClass = "w-[168px]",
}: {
  label: string;
  options?: string[];
  onSelect?: (val: string) => void;
  icon?: ReactNode;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${widthClass}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-[12px] border border-[#e2e8f3] bg-white px-4 text-[14px] font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 truncate">{icon}{label}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-[14px] border border-[#e2e8f3] bg-white py-1 shadow-[0_12px_40px_rgba(20,48,112,0.12)] animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-brand-50 ${
                label === opt || label.endsWith(opt) || label.includes(opt)
                  ? "bg-brand-50 font-bold text-brand-600"
                  : "text-slate-600 hover:text-brand-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar({
  searchValue = "",
  onSearchChange = () => {},
  statusValue = "All Status",
  onStatusChange = () => {},
  statusOptions = ["All Status"],
  sortValue = "Newest",
  onSortChange = () => {},
}: {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  statusValue?: string;
  onStatusChange?: (val: string) => void;
  statusOptions?: string[];
  sortValue?: string;
  onSortChange?: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="flex h-11 flex-1 items-center gap-3 rounded-lg bg-[#F5F8FC] px-4 text-slate-400">
        <Search size={15} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by name, ID or city..."
          className="w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>
      <DropdownField label={statusValue} options={statusOptions} onSelect={onStatusChange} widthClass="w-[168px]" />
      <DropdownField label={`Sort by: ${sortValue}`} options={["Newest", "Oldest"]} onSelect={onSortChange} widthClass="w-[180px]" />
    </div>
  );
}

export function SearchField({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex h-11 items-center gap-3 rounded-xl border border-line bg-white px-4">
      <Search size={16} className="text-slate-400" />
      <span className="text-[14px] text-slate-400">{placeholder}</span>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionCard className="overflow-hidden">
      <div className="border-b border-line px-4 py-3.5 text-[18px] font-semibold text-slate-800 bg-slate-50/30">{title}</div>
      <div className="p-4">{children}</div>
    </SectionCard>
  );
}

export function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <div className="input-base flex items-center bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[14px] text-slate-700">{value}</div>
    </div>
  );
}

export function NotificationRow({
  title,
  text,
  checked,
  onToggle,
  disabled = false,
}: {
  title: string;
  text: string;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between transition-opacity duration-200 ${disabled ? "opacity-60" : ""}`}>
      <div>
        <div className="text-[14px] font-semibold text-slate-855">{title}</div>
        <div className="text-[12px] text-slate-500 leading-normal">{text}</div>
      </div>
      <button type="button" onClick={onToggle} disabled={disabled} className="focus:outline-none disabled:pointer-events-none">
        <Switch checked={checked} />
      </button>
    </div>
  );
}

export function ToggleCard({
  title,
  subtitle,
  checked,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
}) {
  return (
    <div className="rounded-2xl bg-[#F6F8FC] px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[16px] font-semibold text-slate-700">{title}</div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{subtitle}</div>
        </div>
        <Switch checked={checked} />
      </div>
    </div>
  );
}

// Placeholders
export function ChartPlaceholder() {
  const bars = [60, 92, 78, 132, 174, 142, 110, 98, 104];
  return (
    <div className="relative h-[240px] rounded-xl bg-white">
      <div className="absolute left-[44%] top-[10%] rounded bg-[#3A3E43] px-3 py-1 text-[11px] text-white">Peak: 1,240</div>
      <svg viewBox="0 0 620 230" className="absolute inset-0 h-full w-full">
        <path
          d="M20,140 C90,120 120,118 170,124 C220,130 260,116 300,92 C346,64 400,28 470,50 C530,70 540,130 600,122"
          fill="none"
          stroke="#1D5DC3"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute bottom-10 left-0 right-0 flex items-end justify-between gap-3 px-6">
        {bars.map((bar, index) => (
          <div
            key={index}
            className={`flex-1 rounded-t-md ${index === 4 ? "bg-[#1657C0]" : "bg-[#C9DBF7]"}`}
            style={{ height: `${bar}px` }}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6 text-[12px] font-semibold uppercase tracking-[0.04em] text-slate-500">
        <span>Week 1</span>
        <span>Week 2</span>
        <span>Week 3</span>
        <span>Week 4</span>
      </div>
    </div>
  );
}

export function BarPlaceholder() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data = [
    { label: "Mon", value: 75 },
    { label: "Tue", value: 120 },
    { label: "Wed", value: 98 },
    { label: "Thu", value: 142 },
    { label: "Fri", value: 110 },
    { label: "Sat", value: 58 },
    { label: "Sun", value: 66 }
  ];
  const maxValue = 150;

  return (
    <div className="relative h-full group mt-2">
      {/* Dynamic Tooltip */}
      {hoveredIndex !== null && (
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-200"
          style={{ 
            left: `calc(${(hoveredIndex / (data.length - 1)) * 100}% - 24px)`,
            top: '-30px'
          }}
        >
          <div className="relative bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
            {data[hoveredIndex].value} Orders
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        </div>
      )}

      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pt-2 pb-[30px] pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full border-t border-slate-100/60 border-dashed" />
        ))}
      </div>

      <div className="relative z-10 flex h-[calc(100%-24px)] items-end justify-between gap-3 px-1">
        {data.map((item, index) => (
          <div 
            key={item.label} 
            className="flex flex-1 flex-col items-center justify-end gap-3 cursor-pointer group/bar"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div 
              className={`w-full max-w-[48px] rounded-t-[12px] transition-all duration-300 ease-out relative overflow-hidden
                ${hoveredIndex === index ? "bg-brand-500 shadow-[0_4px_20px_rgba(49,101,207,0.3)] scale-y-105 origin-bottom" : 
                  (hoveredIndex !== null ? "bg-[#EEF3FA] opacity-60" : (index === 3 ? "bg-brand-500 shadow-sm" : "bg-[#EEF3FA]"))}
              `} 
              style={{ height: `${(item.value / maxValue) * 130}px` }} 
            >
              {(hoveredIndex === index || (hoveredIndex === null && index === 3)) && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20" />
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.08em] transition-colors duration-200
              ${hoveredIndex === index ? "text-brand-600" : "text-slate-400"}
            `}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LinePlaceholder() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const points = [
    { x: 20, y: 134, val: 240, label: "Week 1" },
    { x: 180, y: 70, val: 420, label: "Week 2" },
    { x: 350, y: 110, val: 310, label: "Week 3" },
    { x: 520, y: 20, val: 590, label: "Week 4" },
    { x: 680, y: 72, val: 450, label: "Week 5" },
  ];

  const pathData = "M20 134 C90 134 110 70 180 70 C250 70 280 110 350 110 C420 110 450 20 520 20 C590 20 630 72 680 72";
  const areaData = `${pathData} L680 186 L20 186 Z`;

  return (
    <div className="relative h-full w-full group mt-2" onMouseLeave={() => setHoveredPoint(null)}>
      {/* Dynamic Tooltip */}
      {hoveredPoint !== null && (
        <div 
          className="absolute z-30 pointer-events-none transition-all duration-200"
          style={{ 
            left: `${(points[hoveredPoint].x / 700) * 100}%`,
            top: `${(points[hoveredPoint].y / 186) * 100}%`,
            transform: 'translate(-50%, -150%)'
          }}
        >
          <div className="relative bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 slide-in-from-bottom-2">
            {points[hoveredPoint].val} Orders
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <svg viewBox="0 0 700 186" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[calc(100%-20px)] w-full overflow-visible z-10 cursor-crosshair">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1D5DC3" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1D5DC3" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[30, 80, 130].map(y => (
          <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
        ))}

        {/* Fill Area */}
        <path
          d={areaData}
          fill="url(#lineGradient)"
          className="transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100"
        />
        
        {/* Main Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#1D5DC3"
          strokeWidth="3.5"
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
          style={{ filter: "drop-shadow(0px 6px 8px rgba(29, 93, 195, 0.25))" }}
        />

        {/* Interactive Points */}
        {points.map((pt, i) => (
          <g 
            key={i} 
            className="cursor-pointer"
            onMouseEnter={() => setHoveredPoint(i)}
          >
            <circle cx={pt.x} cy={pt.y} r="30" fill="transparent" />
            <circle 
              cx={pt.x} 
              cy={pt.y} 
              r={hoveredPoint === i ? "6" : "0"} 
              fill="#fff" 
              stroke="#1D5DC3"
              strokeWidth="3"
              className="transition-all duration-200 ease-out"
            />
          </g>
        ))}
      </svg>

      {/* X-Axis Labels */}
      <div className="absolute bottom-[2px] left-0 right-0 flex justify-between px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
        <span className="w-10 text-center">Wk 1</span>
        <span className="w-10 text-center ml-[70px]">Wk 2</span>
        <span className="w-10 text-center ml-[70px]">Wk 3</span>
        <span className="w-10 text-center ml-[70px]">Wk 4</span>
        <span className="w-10 text-center ml-[60px]">Wk 5</span>
      </div>
    </div>
  );
}

export function FilePreview() {
  return (
    <div className="mx-auto aspect-[0.75] w-[325px] rounded-sm bg-white px-8 py-7 shadow-[0_20px_40px_rgba(30,41,59,0.18)]">
      <div className="flex items-start justify-between">
        <div className="text-[10px] font-bold uppercase">Closing Disclosure</div>
        <div className="text-right text-[6px] text-slate-400">
          <div>OMB No. 3170-0015</div>
          <div>Expires 01/31/2024</div>
        </div>
      </div>
      <div className="mt-2 h-px bg-slate-600" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-3 rounded bg-[#EFF3FA]" />
        <div className="h-3 rounded bg-[#EFF3FA]" />
      </div>
      <div className="mt-5 flex h-[74px] items-center justify-center rounded border border-dashed border-[#D8E1ED] bg-[#F9FBFE] text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-300">
        Document Content Placeholder
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-3 rounded bg-[#EFF3FA]" />
        <div className="h-3 w-11/12 rounded bg-[#EFF3FA]" />
        <div className="h-3 w-10/12 rounded bg-[#EFF3FA]" />
      </div>
      <div className="mt-24 flex justify-between">
        <div className="h-6 w-[70px] rounded bg-[#F5F7FB]" />
        <div className="h-6 w-[70px] rounded bg-[#F5F7FB]" />
      </div>
    </div>
  );
}

// Misc Visual Elements
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-[24px] font-bold leading-none text-slate-900">{title}</h1>
        {description ? <p className="mt-2 text-[14px] text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function InfoBlock({
  label,
  lines,
  strongFirst = false,
  icons = [],
}: {
  label: string;
  lines: string[];
  strongFirst?: boolean;
  icons?: Array<any>;
}) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      {lines.map((line, index) => {
        const Icon = icons[index] ?? icons[0];
        return (
          <div key={`${label}-${line}-${index}`} className={`flex items-center gap-2 ${index > 0 ? "mt-1" : ""}`}>
            {Icon ? <Icon size={14} className="text-brand-500" /> : null}
            <div className={`${strongFirst && index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}>{line}</div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityLog({
  title,
  items,
  footer,
  onFooterClick,
}: {
  title: string;
  items: Array<{ title: string; date: string; tone: string }>;
  footer: string;
  onFooterClick?: () => void;
}) {
  return (
    <SectionCard className="p-4">
      <div className="mb-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</div>
      <div className="max-h-[280px] overflow-y-auto pr-2 scrollbar-thin -mr-2">
        <div className="space-y-5">
          {items.map((item, index) => (
            <div key={`${item.title}-${index}`} className="relative flex gap-4">
              <div className="relative mt-1 flex flex-col items-center">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    item.tone === "green"
                      ? "bg-[#DCF9E5] text-[#2E9F54]"
                      : item.tone === "blue"
                        ? "bg-[#EEF5FF] text-brand-500"
                        : item.tone === "red"
                          ? "bg-[#FDE8E7] text-[#D25753]"
                          : "bg-[#EFF3FA] text-slate-400"
                  }`}
                >
                  <div className="h-2 w-2 rounded-full bg-current" />
                </div>
                {index < items.length - 1 ? <div className="mt-2 h-10 w-px bg-[#E7ECF4]" /> : null}
              </div>
              <div>
                <div className="text-[14px] font-semibold text-slate-700">{item.title}</div>
                <div className="text-[12px] text-slate-400">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onFooterClick}
        className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-brand-500 transition focus:outline-none"
      >
        {footer}
      </button>
    </SectionCard>
  );
}

export function StepProgress({ current, stepItems }: { current: number; stepItems: string[] }) {
  return (
    <div className="flex items-center justify-between">
      {stepItems.map((item, index) => {
        const completed = index < current;
        const isCurrent = index === current;
        const upcoming = index > current;

        return (
          <div key={item} className="relative flex flex-1 flex-col items-center">
            {index < stepItems.length - 1 ? (
              <div className={`absolute left-1/2 top-5 h-[2px] w-full ${completed ? "bg-brand-500" : "bg-[#E3E8F1]"}`} />
            ) : null}
            <div
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                isCurrent
                  ? "border-brand-500 bg-white text-brand-500 shadow-[0_0_0_4px_rgba(29,93,195,0.08)]"
                  : completed
                    ? "border-brand-500 bg-brand-500 text-white"
                    : "border-[#D8E1EE] bg-[#F6F8FC] text-slate-400"
              }`}
            >
              {isCurrent ? <Eye size={16} /> : completed ? <Check size={14} /> : <Circle size={12} fill="currentColor" />}
            </div>
            <div
              className={`mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] ${
                isCurrent ? "text-brand-500" : upcoming ? "text-slate-400" : "text-slate-700"
              }`}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function KeyValue({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="space-y-4 text-[14px]">
      {rows.map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <span className="text-slate-500">{key}</span>
          <span className="font-semibold text-slate-800">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function MetricStrip({ title, value, dot = false }: { title: string; value: string; dot?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{title}</div>
      <div className="mt-1 flex items-center gap-2 text-[18px] font-bold">
        {value}
        {dot ? <span className="h-2.5 w-2.5 rounded-full border border-brand-500" /> : null}
      </div>
    </div>
  );
}
