import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
import { Check, ShieldCheck, X, ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import { Switch } from "../common";

export function Modal({
  children,
  onClose,
  widthClass,
}: {
  children: ReactNode;
  onClose: () => void;
  widthClass: string;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-5 py-5 backdrop-blur-[2px] transition-all duration-300"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[24px] border border-[#dfe6f2] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] animate-in zoom-in-95 duration-200 ${widthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-5 border-b border-[#edf1f7]">
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>
      </div>
      <button
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ModalFooter({ onClose, confirmLabel }: { onClose: () => void; confirmLabel: string }) {
  return (
    <div className="flex items-center justify-end gap-5 rounded-b-[28px] bg-[#EEF3FA] px-5 py-4">
      <button onClick={onClose} className="text-[16px] font-semibold text-slate-600">
        Cancel
      </button>
      <button className="rounded-lg bg-brand-500 px-8 py-3 text-[15px] font-semibold text-white">
        {confirmLabel}
      </button>
    </div>
  );
}

export function ModalActionFooter({
  onClose,
  onConfirm,
  confirmLabel,
}: {
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-[#edf1f7] bg-[#fbfcff] px-7 py-5">
      <button
        onClick={onClose}
        className="h-[46px] rounded-[12px] border border-[#dfe6f2] bg-white px-6 text-[15px] font-semibold text-ink-700 transition hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="h-[46px] rounded-[12px] bg-brand-500 px-8 text-[15px] font-semibold text-white shadow-[0_14px_32px_rgba(29,93,195,0.22)] transition hover:bg-brand-600 hover:-translate-y-0.5"
      >
        {confirmLabel}
      </button>
    </div>
  );
}

export function ModalInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  required = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon?: ReactNode;
  required?: boolean;
}) {
  const isDateType = type === "date";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe Date parsing helper for calendar grid view
  const parseDate = (str: string) => {
    if (!str) return new Date();
    const parts = str.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const partsSlash = str.split("/");
    if (partsSlash.length === 3) {
      const month = parseInt(partsSlash[0], 10) - 1;
      const day = parseInt(partsSlash[1], 10);
      const year = parseInt(partsSlash[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const [viewDate, setViewDate] = useState(() => parseDate(value));

  // Sync viewDate when modal values load or change
  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const days = [];
  // Prev month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: totalDaysInPrevMonth - i,
      month: month === 0 ? 11 : month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }
  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }
  // Next month padding days
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      month: month === 11 ? 0 : month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDisplayDate = (val: string) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${m}/${d}/${y}`;
    }
    return val;
  };

  return (
    <div className="relative" ref={isDateType ? containerRef : undefined}>
      <label className="block">
        <div className="mb-2 text-[13px] font-semibold text-slate-600">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </div>
        <div 
          onClick={() => isDateType && setIsOpen(true)}
          className={`flex h-11 items-center gap-3 rounded-lg border border-[#E1E7F0] bg-[#F5F8FC] px-4 ${
            isDateType ? "cursor-pointer select-none hover:border-brand-200 transition-colors" : ""
          }`}
        >
          {icon}
          {isDateType ? (
            <div className={`w-full text-[14px] ${value ? "text-slate-700 font-medium" : "text-slate-400"}`}>
              {getDisplayDate(value) || placeholder}
            </div>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="w-full border-0 bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
            />
          )}
        </div>
      </label>

      {isDateType && isOpen && (
        <div className="absolute left-0 mt-2 z-50 w-[270px] rounded-[18px] border border-[#E1E7F0] bg-white p-4 shadow-[0_16px_38px_rgba(20,48,112,0.12)] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-[13px] font-bold text-slate-800">
              {monthNames[month]} {year}
            </div>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((item, index) => {
              const isSelected = value && (() => {
                const selected = parseDate(value);
                return (
                  selected.getDate() === item.day &&
                  selected.getMonth() === item.month &&
                  selected.getFullYear() === item.year
                );
              })();

              const isToday = (() => {
                const today = new Date();
                return (
                  today.getDate() === item.day &&
                  today.getMonth() === item.month &&
                  today.getFullYear() === item.year
                );
              })();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    const mm = String(item.month + 1).padStart(2, "0");
                    const dd = String(item.day).padStart(2, "0");
                    const formatted = `${item.year}-${mm}-${dd}`;
                    onChange(formatted);
                    setIsOpen(false);
                  }}
                  className={`h-[28px] w-[28px] rounded-lg text-[11px] font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-sm hover:bg-brand-600"
                      : isToday
                      ? "border border-brand-200 text-brand-600 hover:bg-brand-50"
                      : !item.isCurrentMonth
                      ? "text-slate-300 hover:bg-slate-50"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export type SelectOptionItem = string | { value: string; label: string; sublabel?: string };

export function ModalSelect({
  label,
  value = "",
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOptionItem[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return {
          value: opt === "Select state" || opt.startsWith("Select ") ? "" : opt,
          label: opt,
        };
      }
      return opt;
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return (
      normalizedOptions.find((o) => o.value === value) ||
      (value ? { value, label: value } : null)
    );
  }, [normalizedOptions, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isSearchable = normalizedOptions.length > 5;

  return (
    <div className="relative" ref={containerRef}>
      <label className="block">
        <div className="mb-2 text-[13px] font-semibold text-slate-600">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex h-11 w-full items-center justify-between rounded-lg border border-[#E1E7F0] bg-[#F5F8FC] px-4 text-left text-[14px] outline-none transition-all hover:border-brand-200 ${
            isOpen ? "border-brand-400 ring-2 ring-brand-500/10 shadow-sm bg-white" : ""
          } ${className}`}
        >
          <span className={selectedOption && selectedOption.value !== "" ? "font-medium text-slate-800 truncate" : "text-slate-400"}>
            {selectedOption && selectedOption.value !== "" ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : ""}`} />
        </button>
      </label>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 overflow-hidden rounded-xl border border-[#dfe6f2] bg-white p-1.5 shadow-[0_16px_36px_rgba(20,48,112,0.14)] animate-in fade-in zoom-in-95 duration-150">
          {isSearchable && (
            <div className="relative mb-1 p-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state..."
                className="w-full rounded-lg border border-[#e4ebf5] bg-[#f8fbff] py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-brand-300 focus:bg-white"
                autoFocus
              />
            </div>
          )}
          <div className="max-h-52 overflow-y-auto pr-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-slate-400">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value + opt.label}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] text-left transition-colors ${
                      isSelected
                        ? "bg-brand-50 font-bold text-brand-600"
                        : "text-slate-700 font-medium hover:bg-[#f5f8ff] hover:text-slate-900"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-500 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ModalCheckbox({
  checked,
  onToggle,
  label,
  className = "",
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 text-[14px] font-medium text-slate-600 ${className}`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border transition ${
          checked ? "border-brand-500 bg-brand-500 text-white" : "border-[#D5DDE9] bg-white text-transparent"
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </span>
      {label}
    </button>
  );
}

export function SegmentedToggle({
  left,
  right,
  active,
  onChange,
}: {
  left: string;
  right: string;
  active: "left" | "right";
  onChange: (value: "left" | "right") => void;
}) {
  return (
    <div className="flex rounded-full bg-[#E9EEF6] p-1">
      <button
        onClick={() => onChange("left")}
        className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${
          active === "left" ? "bg-white text-brand-500 shadow-sm" : "text-slate-500"
        }`}
      >
        {left}
      </button>
      <button
        onClick={() => onChange("right")}
        className={`rounded-full px-5 py-2 text-[13px] font-semibold transition ${
          active === "right" ? "bg-white text-brand-500 shadow-sm" : "text-slate-500"
        }`}
      >
        {right}
      </button>
    </div>
  );
}

export function ToggleOptionCard({
  title,
  subtitle,
  checked,
  onToggle,
  icon,
  activeColor = "text-brand-500",
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onToggle: () => void;
  icon: ReactNode;
  activeColor?: string;
}) {
  return (
    <div className={`rounded-xl px-5 py-4 border transition-all duration-200 ${checked ? "bg-white border-slate-200 shadow-sm" : "bg-[#F5F8FC] border-transparent"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`transition-colors duration-200 ${checked ? "text-brand-500" : "text-slate-400"}`}>{icon}</div>
          <div>
            <div className="text-[14px] font-bold text-slate-800">{title}</div>
            <div className={`text-[10px] font-bold uppercase tracking-[0.08em] transition-colors duration-200 ${checked ? activeColor : "text-slate-400"}`}>
              {subtitle}
            </div>
          </div>
        </div>
        <button type="button" onClick={onToggle} className="focus:outline-none">
          <Switch checked={checked} />
        </button>
      </div>
    </div>
  );
}

export function InputField({ label, placeholder, icon }: { label: string; placeholder: string; icon?: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[14px] font-semibold text-slate-600">{label}</div>
      <div className="input-base flex items-center gap-3 border border-slate-100 rounded-xl px-4 py-3 text-[14px]">
        {icon}
        <span className="text-slate-400">{placeholder}</span>
      </div>
    </div>
  );
}

export function ToggleGroup({ left, right, active }: { left: string; right: string; active: "left" | "right" }) {
  return (
    <div className="flex rounded-full bg-[#E9EEF6] p-1">
      <button
        className={`rounded-full px-5 py-2 text-[13px] font-semibold ${
          active === "left" ? "bg-white text-brand-500 shadow-sm" : "text-slate-500"
        }`}
      >
        {left}
      </button>
      <button
        className={`rounded-full px-5 py-2 text-[13px] font-semibold ${
          active === "right" ? "bg-white text-brand-500 shadow-sm" : "text-slate-500"
        }`}
      >
        {right}
      </button>
    </div>
  );
}

export function ModalSectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 text-[16px] font-semibold uppercase tracking-[0.12em] text-brand-500">
      <ShieldCheck size={16} />
      {title}
    </div>
  );
}
