import { useState, useEffect } from "react";
import { Eye, Pencil, Trash2, MoreVertical, UserPlus, Download, FileText } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { usersApi } from "../../api/users";
import { ordersApi } from "../../api/orders";
import type { DocumentTableRow } from "../../api/documents";
import { StatusBadge, Pagination, Avatar, SectionCard } from "../common";
import { profileGradients } from "../../data";
import type { StatusKey, CompanyUser, NotaryUser } from "../../types";

export function CompanyTable({
  onViewCompany,
  onEditCompany,
  rows,
}: {
  onViewCompany: (company: CompanyUser) => void;
  onEditCompany?: (company: CompanyUser) => void;
  rows: CompanyUser[];
}) {
  const { setCompanies, showConfirm } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete Company?",
      `Are you sure you want to remove ${name} from the system? This action will permanently delete all associated data.`,
      () => {
        void usersApi.deleteCompany(id).then(() => {
          setCompanies((prev) => prev.filter((c) => c.id !== id));
        });
      },
      "Delete",
      "danger"
    );
  };

  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => (i + 1).toString());

  return (
    <SectionCard className="overflow-hidden">
      <table className="w-full">
        <thead className="table-head">
          <tr>
            <th className="px-5 py-4 text-left">Company Name</th>
            <th className="px-3 py-4 text-left">Contact Person</th>
            <th className="px-3 py-4 text-left">Contact Details</th>
            <th className="px-3 py-4 text-left">Status</th>
            <th className="px-3 py-4 text-left">Created Date</th>
            <th className="px-5 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((company) => (
            <tr key={company.id} className="border-t border-line bg-white text-[14px]">
              <td className="px-5 py-6">
                <div className="flex items-center gap-3">
                  <Avatar
                    className="h-8 w-8 rounded-lg"
                    gradient={profileGradients.alex}
                    src={company.avatarUrl}
                    alt={`${company.companyName} avatar`}
                    initials={company.initials}
                  />
                  <div>
                    <div className="max-w-[130px] text-[14px] font-semibold leading-5 text-slate-800">{company.companyName}</div>
                    {company.publicId && (
                      <div className="mt-1 font-mono text-[11px] font-semibold text-slate-400">{company.publicId}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-6 text-slate-700">{company.contactPerson}</td>
              <td className="px-3 py-6">
                <div className="leading-5 text-slate-700">{company.businessEmail}</div>
                <div className="mt-1 text-[12px] text-slate-500">{company.phone}</div>
              </td>
              <td className="px-3 py-6">
                <StatusBadge status={company.status as StatusKey} />
              </td>
              <td className="px-3 py-6 text-slate-500">{company.createdDate}</td>
              <td className="px-5 py-6">
                <div className="flex items-center gap-4 text-slate-500">
                  <button onClick={() => onViewCompany(company)} className="hover:text-brand-500 focus:outline-none transition">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => onEditCompany?.(company)} className="hover:text-brand-500 focus:outline-none transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(company.id, company.companyName)} className="hover:text-[#D14544] focus:outline-none transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        footer={`Showing ${rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, rows.length)} of ${rows.length} companies`}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        withPrevious={totalPages > 1}
      />
    </SectionCard>
  );
}

export function NotaryTable({
  onViewNotary,
  onEditNotary,
  rows,
}: {
  onViewNotary: (notary: NotaryUser) => void;
  onEditNotary?: (notary: NotaryUser) => void;
  rows: NotaryUser[];
}) {
  const { setNotaries, showConfirm } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      "Delete Notary?",
      `Are you sure you want to remove ${name} from the network? This will revoke their access to the portal immediately.`,
      () => {
        void usersApi.deleteNotary(id).then(() => {
          setNotaries((prev) => prev.filter((n) => n.id !== id));
        });
      },
      "Delete",
      "danger"
    );
  };

  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => (i + 1).toString());

  return (
    <SectionCard className="overflow-hidden">
      <table className="w-full">
        <thead className="table-head">
          <tr>
            <th className="px-4 py-4 text-left">Name</th>
            <th className="px-4 py-4 text-left">Contact Details</th>
            <th className="px-4 py-4 text-left">License No.</th>
            <th className="px-4 py-4 text-left">Status</th>
            <th className="px-4 py-4 text-left">Created Date</th>
            <th className="px-4 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((notary) => (
            <tr key={notary.id} className="border-t border-line text-[14px]">
              <td className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${notary.color}`}>
                    {notary.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{notary.fullName}</div>
                    <div className="text-[12px] text-slate-500">{notary.specialty}</div>
                    {notary.publicId && (
                      <div className="mt-1 font-mono text-[11px] font-semibold text-slate-400">{notary.publicId}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-5">
                <div className="text-slate-700">{notary.email}</div>
                <div className="text-[12px] text-slate-500">{notary.phone}</div>
              </td>
              <td className="px-4 py-5">
                <span className="rounded-md bg-[#EEF3FA] px-3 py-1 text-[13px] text-slate-600">{notary.license}</span>
              </td>
              <td className="px-4 py-5">
                <StatusBadge status={notary.status as StatusKey} />
              </td>
              <td className="px-4 py-5 text-slate-500">{notary.createdDate}</td>
              <td className="px-4 py-5">
                <div className="flex items-center gap-4 text-slate-500">
                  <button onClick={() => onViewNotary(notary)} className="hover:text-brand-500 focus:outline-none transition">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => onEditNotary?.(notary)} className="hover:text-brand-500 focus:outline-none transition">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(notary.id, notary.fullName)} className="hover:text-[#D14544] focus:outline-none transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        footer={`Showing ${rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, rows.length)} of ${rows.length} notaries`}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        withPrevious={totalPages > 1}
      />
    </SectionCard>
  );
}

export function OrderTable({
  onOpenOrder,
  onAssign,
  rows,
}: {
  onOpenOrder: (id: string) => void;
  onAssign: (id: string) => void;
  rows: any[];
}) {
  const { setOrders, showConfirm, notaries } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const pageSize = 10;
  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  const initialsFromName = (value: string) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleDelete = (id: string) => {
    showConfirm(
      "Delete Order?",
      `Are you sure you want to permanently delete order ${id}? This action cannot be undone.`,
      () => {
        void ordersApi.deleteOrder(id).then(() => {
          setOrders((prev: any) => prev.filter((o: any) => o[0] !== id));
        });
      },
      "Delete",
      "danger"
    );
  };

  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => (i + 1).toString());

  return (
    <SectionCard className="overflow-hidden">
      <table className="w-full">
        <thead className="table-head">
          <tr>
            <th className="px-5 py-4 text-left">Order ID</th>
            <th className="px-5 py-4 text-left">Title Company</th>
            <th className="px-5 py-4 text-left">Assigned Notary</th>
            <th className="px-5 py-4 text-left">Property Location</th>
            <th className="px-5 py-4 text-left">Date</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map(([id, company, companyInitials, notary, location, date, status, avatar]) => {
            const isUnassigned = avatar === "none" || !notary || notary === "Unassigned";
            const isOpenForAll = notary === "Open for All";
            const assignedNotary = isUnassigned
              ? undefined
              : notaries.find((entry) => entry.fullName.toLowerCase() === notary.toLowerCase());
            const fallbackGradient = avatar === "jane" ? profileGradients.jane : profileGradients.mark;

            return (
              <tr key={id} className="border-t border-line bg-white text-[14px]">
                <td className="px-5 py-5">
                  <button
                    onClick={() => onOpenOrder(id)}
                    className="whitespace-pre-line text-left font-semibold leading-6 text-brand-500 focus:outline-none hover:text-brand-600 transition animate-hover"
                  >
                    {id.replace("-", "-\n")}
                  </button>
                </td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#E9EEF6] text-[12px] font-bold text-slate-500">
                      {companyInitials}
                    </div>
                    <div className="max-w-[118px] whitespace-pre-line leading-5 text-slate-800">{company}</div>
                  </div>
                </td>
                <td className="px-5 py-5">
                  {isUnassigned ? (
                    isOpenForAll ? (
                      <div className="inline-flex rounded-full bg-[#EEF5FF] px-3 py-1 text-[12px] font-semibold text-brand-600">
                        Open for All
                      </div>
                    ) : (
                      <div className="text-[14px] italic text-slate-400">Unassigned</div>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar
                        className="h-8 w-8"
                        gradient={fallbackGradient}
                        src={assignedNotary?.avatarUrl}
                        alt={`${notary} avatar`}
                        initials={initialsFromName(notary)}
                      />
                      <div className="whitespace-pre-line leading-5 text-slate-800">{notary}</div>
                    </div>
                  )}
                </td>
                <td className="px-5 py-5 whitespace-pre-line leading-5 text-slate-850">{location}</td>
                <td className="px-5 py-5 whitespace-pre-line leading-5 text-slate-500">{date}</td>
                <td className="px-5 py-5">
                  <StatusBadge status={status as StatusKey} />
                </td>
                <td className="px-5 py-5">
                  <div className="flex items-center gap-4 text-slate-500">
                    <button onClick={() => onOpenOrder(id)} className="hover:text-brand-500 focus:outline-none transition">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => onAssign(id)} className="hover:text-brand-500 focus:outline-none transition">
                      <UserPlus size={16} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(activeDropdownId === id ? null : id);
                        }}
                        className="hover:text-slate-700 focus:outline-none transition"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {activeDropdownId === id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white py-1 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenOrder(id);
                              setActiveDropdownId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Eye size={14} className="text-slate-400" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssign(id);
                              setActiveDropdownId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
                          >
                            <UserPlus size={14} className="text-slate-400" />
                            Assign Notary
                          </button>
                          <hr className="my-1 border-slate-100" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(id);
                              setActiveDropdownId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 size={14} className="text-rose-500" />
                            Delete Order
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Pagination
        footer={`Showing ${rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, rows.length)} of ${rows.length} orders`}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        withPrevious={totalPages > 1}
      />
    </SectionCard>
  );
}

export function DocumentTable({
  onOpenDocument,
  onDeleteDocument,
  onDownloadDocument,
  rows,
}: {
  onOpenDocument: (row: DocumentTableRow) => void;
  onDeleteDocument: (row: DocumentTableRow) => void;
  onDownloadDocument: (row: DocumentTableRow) => void;
  rows: DocumentTableRow[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(rows.length / pageSize) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pages = Array.from({ length: totalPages }, (_, i) => (i + 1).toString());

  return (
    <SectionCard className="overflow-hidden">
      <table className="w-full">
        <thead className="table-head">
          <tr>
            <th className="px-5 py-4 text-left">File Name</th>
            <th className="px-5 py-4 text-left">Order ID</th>
            <th className="px-5 py-4 text-left">Uploaded By</th>
            <th className="px-5 py-4 text-left">Date</th>
            <th className="px-5 py-4 text-left">Size</th>
            <th className="px-5 py-4 text-left">Status</th>
            <th className="px-5 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row) => {
            const [fileName, orderId, uploadedBy, date, size, status, documentId] = row;

            return (
            <tr key={documentId} className="border-t border-line bg-white">
              <td className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0EF] text-[#EB5B53]">
                    <FileText size={16} />
                  </div>
                  <button
                    onClick={() => onOpenDocument(row)}
                    className="font-semibold text-slate-800 text-left hover:text-brand-500 transition focus:outline-none"
                  >
                    {fileName}
                  </button>
                </div>
              </td>
              <td className="px-5 py-4 font-semibold text-brand-500">{orderId}</td>
              <td className="px-5 py-4">
                <span className="rounded-md bg-[#EEF3FA] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-slate-500">
                  {uploadedBy}
                </span>
              </td>
              <td className="px-5 py-4 text-slate-500">{date}</td>
              <td className="px-5 py-4 text-slate-500">{size}</td>
              <td className="px-5 py-4">
                <StatusBadge status={status as StatusKey} />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-5 text-slate-500">
                  <button
                    onClick={() => onOpenDocument(row)}
                    className="hover:text-brand-500 focus:outline-none transition"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => onDownloadDocument(row)}
                    className="hover:text-brand-500 focus:outline-none transition"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(row)}
                    className="hover:text-brand-500 focus:outline-none transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
      <Pagination
        footer={`Showing ${rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, rows.length)} of ${rows.length} documents`}
        pages={pages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        withPrevious={totalPages > 1}
      />
    </SectionCard>
  );
}
