"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher";
import { Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ExchangeFeedbackForm } from "@/components/feedback/exchange-feedback-form";

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  customPhotoUrl: string | null;
  jobTitle: string | null;
  company: string | null;
  spDomain: string | null;
  spAction: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    customPhotoUrl: string | null;
  };
}

interface ExchangeChatProps {
  matchId: string;
  matchStatus: string;
  memberId: string;
  partner: Partner;
  matchScore: { totalScore: number; tier: string; reasoning: string | null } | null;
  initialMessages: ChatMessage[];
  hasFeedback: boolean;
}

export function ExchangeChat({
  matchId,
  matchStatus,
  memberId,
  partner,
  matchScore,
  initialMessages,
  hasFeedback,
}: ExchangeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(matchStatus === "COMPLETED");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Pusher real-time subscription
  useEffect(() => {
    if (isCompleted) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`match-${matchId}`);

    channel.bind("new-message", (message: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`match-${matchId}`);
    };
  }, [matchId, isCompleted]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setInput("");
      }
    } catch { /* ignore */ }
    setSending(false);
  };

  const markComplete = async () => {
    try {
      await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      setIsCompleted(true);
      setShowFeedback(true);
    } catch { /* ignore */ }
  };

  const partnerPhoto = partner.customPhotoUrl || partner.imageUrl;
  const isActive = matchStatus === "ACTIVE" && !isCompleted;

  // Show feedback form
  if (showFeedback && !hasFeedback) {
    return (
      <ExchangeFeedbackForm
        matchId={matchId}
        partnerName={partner.firstName}
        onComplete={() => router.push("/dashboard")}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Partner Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/[0.06]">
        <Link href="/matches" className="text-white/30 hover:text-white/60 transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        {partnerPhoto ? (
          <img src={partnerPhoto} alt={partner.firstName} className="size-10 rounded-full object-cover border border-white/[0.08]" />
        ) : (
          <div className="size-10 rounded-full bg-white/[0.08] flex items-center justify-center text-sm font-medium text-white/50">
            {partner.firstName[0]}{partner.lastName[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">{partner.firstName} {partner.lastName}</span>
            {matchScore && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/[0.1] text-white/30">
                {matchScore.tier}
              </span>
            )}
            {isCompleted && <span className="text-[10px] text-white/30 bg-white/[0.06] px-2 py-0.5 rounded-full">Completed</span>}
          </div>
          <p className="text-xs text-white/30 truncate">
            {partner.jobTitle}{partner.company ? ` at ${partner.company}` : ""}
            {partner.spDomain ? ` · ${partner.spDomain.split(",")[0]}` : ""}
          </p>
        </div>
        {isActive && (
          <button onClick={markComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-medium transition-colors">
            <CheckCircle2 className="size-3.5" /> Complete
          </button>
        )}
        {isCompleted && !hasFeedback && (
          <button onClick={() => setShowFeedback(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-medium transition-colors">
            Give Feedback
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/30 text-sm">No messages yet.</p>
            <p className="text-white/20 text-xs mt-1">Start the conversation with {partner.firstName}!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === memberId;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] ${isMine ? "order-2" : ""}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMine
                    ? "bg-amber-400/15 text-white/80 rounded-br-md"
                    : "bg-white/[0.06] text-white/70 rounded-bl-md"
                }`}>
                  {msg.content}
                </div>
                <p className={`text-[10px] text-white/20 mt-1 ${isMine ? "text-right" : ""}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isActive && (
        <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message ${partner.firstName}...`}
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-amber-400/30"
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}
            className="px-4 py-2.5 rounded-xl bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 disabled:opacity-30 transition-colors">
            <Send className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
