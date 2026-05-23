import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Loader2, MapPin, MessageCircle, Search, Send, UserRound } from "lucide-react";

import { communicationsApi, type CommunicationConversation, type CommunicationMessage, type CommunicationSendResult, type CommunicationSocket, type CommunicationThread } from "../api/communications";
import { ordersApi, type OrderDetail, type OrderRow } from "../api/orders";
import { PageHeader, SectionCard, StatusBadge } from "../components/common";
import { useToast } from "../components/Toast";
import { useAppContext } from "../context/AppContext";
import type { StatusKey } from "../types";

interface SocketAck<T> {
  success: boolean;
  data?: T;
  message?: string;
}

type OrderChatRow = {
  id: string;
  company: string;
  clientName: string;
  notary: string;
  location: string;
  date: string;
  status: string;
  thread?: CommunicationThread;
  startable?: boolean;
};

const mergeMessage = (messages: CommunicationMessage[], next: CommunicationMessage) =>
  messages.some((message) => message.id === next.id) ? messages : [...messages, next];

const displayDate = (value: string) => value.replace("\n", " • ");
const threadActivityLabel = (value?: string) => {
  if (!value) return "";
  const timestamp = new Date(value);
  const now = new Date();
  if (timestamp.toDateString() === now.toDateString()) {
    return timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  return timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export function CommunicationsPage({
  onOpenOrder,
}: {
  onOpenOrder?: (orderId: string) => void;
}) {
  const { orders, setOrders } = useAppContext();
  const { showToast } = useToast();
  const [threads, setThreads] = useState<CommunicationThread[]>([]);
  const [orderDetailsById, setOrderDetailsById] = useState<Record<string, OrderDetail>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [conversation, setConversation] = useState<CommunicationConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConversationLoading, setIsConversationLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<CommunicationSocket | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const orderDetailsRef = useRef<Record<string, OrderDetail>>({});

  useEffect(() => {
    orderDetailsRef.current = orderDetailsById;
  }, [orderDetailsById]);

  const rows = useMemo<OrderChatRow[]>(() => {
    const threadByOrder = new Map(threads.map((thread) => [thread.orderNumber, thread]));
    const threadRows: OrderChatRow[] = (orders as OrderRow[])
      .filter(([id]) => threadByOrder.has(id))
      .map(([id, company, , notary, location, date, status]) => ({
        id,
        company,
        clientName: orderDetailsById[id]?.clientName || "",
        notary,
        location,
        date,
        status,
        thread: threadByOrder.get(id),
      }));

    const query = searchQuery.trim().toLowerCase();
    const filteredThreads = threadRows.filter((row) => {
      if (!query) return true;
      return `${row.id} ${row.company} ${row.clientName} ${row.notary} ${row.location} ${row.thread?.lastMessage ?? ""}`
        .toLowerCase()
        .includes(query);
    });

    const starterRows: OrderChatRow[] = !query
      ? []
      : (orders as OrderRow[])
          .filter(([id]) => !threadByOrder.has(id) && id.toLowerCase().includes(query))
          .map(([id, company, , notary, location, date, status]) => ({
        id,
        company,
        clientName: orderDetailsById[id]?.clientName || "",
        notary,
        location,
        date,
        status,
        thread: undefined,
        startable: true,
      }));

    return [...starterRows, ...filteredThreads].sort((a, b) => {
      if (a.startable !== b.startable) return a.startable ? -1 : 1;
      const aTime = a.thread?.lastMessageAt ? new Date(a.thread.lastMessageAt).getTime() : 0;
      const bTime = b.thread?.lastMessageAt ? new Date(b.thread.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [orderDetailsById, orders, searchQuery, threads]);

  const selectedRow = rows.find((row) => row.id === selectedOrderId) || rows[0];
  const selectedHasNotary = Boolean(
    selectedRow?.notary && selectedRow.notary !== "Unassigned" && selectedRow.notary !== "Open for All",
  );
  const activeConversationCount = threads.length;

  useEffect(() => {
    let isMounted = true;

    const loadModule = async () => {
      try {
        setIsLoading(true);
        const [liveOrders, liveThreads] = await Promise.all([ordersApi.getOrders(), communicationsApi.getThreads()]);
        if (!isMounted) return;
        setOrders(liveOrders);
        setThreads(liveThreads);
        setSelectedOrderId((current) => current || liveThreads[0]?.orderNumber || "");

        const detailPairs = await Promise.all(
          liveThreads.map(async (thread) => {
            try {
              const detail = await ordersApi.getOrderDetail(thread.orderNumber);
              return [thread.orderNumber, detail] as const;
            } catch {
              return null;
            }
          }),
        );
        if (!isMounted) return;
        setOrderDetailsById(
          detailPairs.reduce<Record<string, OrderDetail>>((acc, item) => {
            if (item) acc[item[0]] = item[1];
            return acc;
          }, {}),
        );

        const socket = communicationsApi.createSocket();
        socketRef.current = socket;
        socket?.on("communications:message", (payload) => {
          if (!isMounted) return;
          setThreads((current) => {
            const withoutCurrent = current.filter((thread) => thread.id !== payload.thread.id);
            return [payload.thread, ...withoutCurrent];
          });
          if (!orderDetailsRef.current[payload.thread.orderNumber]) {
            void ordersApi.getOrderDetail(payload.thread.orderNumber).then((detail) => {
              if (!isMounted) return;
              setOrderDetailsById((current) => ({ ...current, [payload.thread.orderNumber]: detail }));
            }).catch(() => undefined);
          }
          setConversation((current) => {
            if (!current || current.thread.orderNumber !== payload.thread.orderNumber) return current;
            return {
              thread: payload.thread,
              messages: mergeMessage(current.messages, payload.message),
            };
          });
        });
      } catch (error) {
        if (isMounted) {
          showToast("Communications Unavailable", {
            message: error instanceof Error ? error.message : "Unable to load communications.",
            variant: "error",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadModule();

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [setOrders, showToast]);

  useEffect(() => {
    if (!selectedRow?.id) return;

    let isMounted = true;
    setIsConversationLoading(true);
    setDraft("");

    communicationsApi
      .getOrderMessages(selectedRow.id)
      .then(async (loadedConversation) => {
        if (!isMounted) return;
        if (!orderDetailsById[selectedRow.id]) {
          try {
            const detail = await ordersApi.getOrderDetail(selectedRow.id);
            if (!isMounted) return;
            setOrderDetailsById((current) => ({ ...current, [selectedRow.id]: detail }));
          } catch {
            // Keep the thread usable even if the detail fetch fails.
          }
        }
        setConversation(loadedConversation);
        setThreads((current) => {
          const withoutCurrent = current.filter((thread) => thread.id !== loadedConversation.thread.id);
          return [loadedConversation.thread, ...withoutCurrent];
        });
        socketRef.current?.emit("communications:join-order", selectedRow.id, (ack: SocketAck<CommunicationConversation>) => {
          if (ack.success && ack.data && isMounted) setConversation(ack.data);
        });
      })
      .catch((error) => {
        if (isMounted) {
          setConversation(null);
          showToast("Chat Unavailable", {
            message: error instanceof Error ? error.message : "Unable to load order chat.",
            variant: "error",
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsConversationLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRow?.id, showToast]);

  useEffect(() => {
    const messages = messagesRef.current;
    if (!messages) return;
    messages.scrollTop = messages.scrollHeight;
  }, [conversation?.messages.length, selectedOrderId]);

  const sendMessage = () => {
    const body = draft.trim();
    const orderId = selectedRow?.id;
    if (!body || !orderId || isSending || !selectedHasNotary) return;

    const applySentMessage = (result: CommunicationSendResult) => {
      setConversation((current) =>
        current
          ? { thread: result.thread, messages: mergeMessage(current.messages, result.message) }
          : { thread: result.thread, messages: [result.message] },
      );
      setThreads((current) => {
        const withoutCurrent = current.filter((thread) => thread.id !== result.thread.id);
        return [result.thread, ...withoutCurrent];
      });
      setDraft("");
      setSearchQuery("");
    };

    setIsSending(true);
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("communications:send-message", { orderNumber: orderId, body }, (ack: SocketAck<CommunicationSendResult>) => {
        setIsSending(false);
        if (!ack.success || !ack.data) {
          showToast("Message Failed", { message: ack.message || "Unable to send message.", variant: "error" });
          return;
        }
        applySentMessage(ack.data);
      });
      return;
    }

    communicationsApi
      .sendOrderMessage(orderId, body)
      .then(applySentMessage)
      .catch((error) => {
        showToast("Message Failed", {
          message: error instanceof Error ? error.message : "Unable to send message.",
          variant: "error",
        });
      })
      .finally(() => setIsSending(false));
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-4 overflow-hidden">
      <div className="shrink-0 rounded-[26px] border border-[#e6ebf5] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-6">
          <PageHeader
            title="Communications"
            description="Manage live order conversations, jump across threads quickly, and respond without leaving the admin workspace."
          />
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <div className="rounded-2xl border border-[#dbe6f6] bg-white px-4 py-3 text-right shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Active Threads</div>
              <div className="mt-1 text-[24px] font-black tracking-[-0.04em] text-slate-900">{activeConversationCount}</div>
            </div>
            <div className="rounded-2xl border border-[#dbe6f6] bg-white px-4 py-3 text-right shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Selected Order</div>
              <div className="mt-1 text-[15px] font-extrabold text-brand-700">{selectedRow?.id || "None"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[340px_1fr] gap-4 overflow-hidden">
        <SectionCard className="flex min-h-0 h-full flex-col overflow-hidden border border-[#e4eaf4] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
          <div className="border-b border-line bg-white px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[16px] font-extrabold tracking-[-0.02em] text-slate-900">Conversation Queue</div>
                <div className="mt-1 text-[12px] text-slate-500">{activeConversationCount} live thread{activeConversationCount === 1 ? "" : "s"}</div>
              </div>
              <div className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">Orders</div>
            </div>
            <div className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-[#F8FAFD] px-4 text-slate-400 shadow-sm">
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-full w-full bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search order ID to start or find a chat..."
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-transparent p-3">
            {isLoading ? (
              <div className="flex h-[420px] items-center justify-center text-[13px] font-semibold text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading communications...
              </div>
            ) : rows.length === 0 ? (
              <div className="flex h-[420px] flex-col items-center justify-center px-8 text-center">
                <MessageCircle className="mb-3 h-9 w-9 text-slate-300" />
                <div className="text-[14px] font-bold text-slate-800">No conversations yet</div>
                <div className="mt-1 text-[12px] leading-5 text-slate-500">Existing order chats appear here. Search by order id to start a new one.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((row) => {
                  const isActive = row.id === selectedRow?.id;
                  const lastMessage = row.thread?.lastMessage || "Start a new conversation for this order";
                  const activityLabel = threadActivityLabel(row.thread?.lastMessageAt);
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedOrderId(row.id)}
                      className={`w-full rounded-[22px] border px-4 py-3.5 text-left transition focus:outline-none ${
                        isActive
                          ? "border-[#b6cdf8] bg-white shadow-[0_18px_36px_rgba(37,99,214,0.14)] ring-1 ring-[#d9e7ff]"
                          : "border-transparent bg-white/80 hover:border-slate-200 hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[14px] font-extrabold text-slate-900">{row.id}</div>
                          <div className="mt-1 truncate text-[12px] font-semibold text-slate-700">
                            {row.clientName || row.company}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {activityLabel ? <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{activityLabel}</span> : null}
                          {row.startable ? (
                            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-600">
                              Start
                            </span>
                          ) : row.thread?.unreadCount ? (
                            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                              {row.thread.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                        <UserRound size={14} className="text-brand-500" />
                        <span className={row.notary === "Unassigned" || row.notary === "Open for All" ? "text-amber-600" : ""}>
                          {row.notary}
                        </span>
                      </div>
                      <div className="mt-2 rounded-2xl bg-[#f8fbff] px-3 py-2.5 text-[12px] leading-5 text-slate-600">
                        <span className="line-clamp-2">{lastMessage}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard className="flex min-h-0 h-full overflow-hidden border border-[#e4eaf4] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          {selectedRow ? (
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="shrink-0 border-b border-line bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-[22px] font-black tracking-[-0.02em] text-slate-950">{selectedRow.id}</h2>
                      <StatusBadge status={selectedRow.status as StatusKey} />
                    </div>
                    <div className="mt-2 text-[13px] font-semibold text-slate-800">
                      {orderDetailsById[selectedRow.id]?.clientName || selectedRow.clientName || selectedRow.company}
                    </div>
                    <div className="mt-2 grid gap-3 text-[13px] text-slate-500 md:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <UserRound size={15} className="text-brand-500" />
                        <span className="font-semibold text-slate-700">{selectedRow.notary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="text-brand-500" />
                        <span>{displayDate(selectedRow.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className="text-brand-500" />
                        <span className="truncate">{selectedRow.location}</span>
                      </div>
                    </div>
                  </div>
                  {onOpenOrder ? (
                    <button
                      type="button"
                      onClick={() => onOpenOrder(selectedRow.id)}
                      className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-[13px] font-bold text-brand-600 transition hover:bg-brand-100"
                    >
                      View Order
                    </button>
                  ) : null}
                </div>
              </div>

              <div
                ref={messagesRef}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(37,99,214,0.06),transparent_28%),linear-gradient(180deg,#f7faff_0%,#f2f6fc_100%)] px-6 py-5"
              >
                {isConversationLoading ? (
                  <div className="flex h-full items-center justify-center text-[13px] font-semibold text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading chat...
                  </div>
                ) : conversation?.messages.length ? (
                  conversation.messages.map((message) => {
                    const mine = message.senderRole === "admin";
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[68%] rounded-[22px] px-4 py-3 text-[14px] shadow-sm ${
                            mine
                              ? "rounded-br-md bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-white shadow-[0_14px_30px_rgba(37,99,214,0.22)]"
                              : "rounded-bl-md border border-slate-100 bg-white text-slate-800 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
                          }`}
                        >
                          <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.12em] ${mine ? "text-white/65" : "text-slate-400"}`}>
                            {mine ? "Admin" : message.senderName}
                          </div>
                          <div className="whitespace-pre-wrap leading-6">{message.body}</div>
                          <div className={`mt-1 text-[10px] font-semibold ${mine ? "text-white/65" : "text-slate-400"}`}>
                            {message.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-[0_12px_24px_rgba(37,99,214,0.12)]">
                      <MessageCircle size={26} />
                    </div>
                    <div className="text-[16px] font-bold text-slate-900">No messages yet</div>
                    <div className="mt-2 max-w-[360px] text-[13px] leading-6 text-slate-500">
                      Start a focused order conversation with the assigned notary. Messages are saved to this order thread.
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-line bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-3.5">
                {!selectedHasNotary ? (
                  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-700">
                    Assign a notary to this order before sending messages.
                  </div>
                ) : null}
                <div className="flex items-end gap-3 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    rows={1}
                    disabled={!selectedHasNotary}
                    maxLength={4000}
                    placeholder="Write a message to the assigned notary..."
                    className="max-h-28 min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!draft.trim() || isSending || !selectedHasNotary}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_100%)] text-white shadow-[0_12px_28px_rgba(37,99,214,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    aria-label="Send message"
                  >
                    {isSending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-[14px] font-semibold text-slate-500">
              Select an order conversation to begin.
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
