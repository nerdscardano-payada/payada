import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AGENT_NAME = "payment_builder";

export default function AdminAIBuildChat() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let unsubscribe;

    const init = async () => {
      const created = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: {
          name: "Admin AI Payment Builder",
          description: "Admin prototype conversation",
        },
      });

      setConversation(created);
      setMessages(created.messages || []);

      unsubscribe = base44.agents.subscribeToConversation(created.id, (data) => {
        setMessages(data.messages || []);
      });
    };

    init();
    return () => unsubscribe?.();
  }, []);

  const handleSend = async () => {
    if (!conversation || !input.trim() || sending) return;
    setSending(true);
    await base44.agents.addMessage(conversation, {
      role: "user",
      content: input.trim(),
    });
    setInput("");
    setSending(false);
  };

  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Bot className="h-4 w-4 text-primary" />
          Builder chat
        </div>
      </div>

      <div className="h-[480px] space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
            Ask the AI to create a payment link or subscription plan for a merchant.
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                {isUser ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert">
                    {message.content || "..."}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4">
        <div className="flex flex-col gap-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the payment tool you want to create..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={!input.trim() || sending || !conversation} className="gap-2">
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}