"use client";

import React, { useState, useEffect, useRef } from "react";
import { getTasks, saveTask, Task } from "@/lib/firebase";
import { IconMessageChatbot, IconX, IconSend, IconPlus, IconCheck } from "@tabler/icons-react";

interface Message {
  sender: "user" | "companion";
  text: string;
  timestamp: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    setMessages([
      {
        sender: "companion",
        text: "Hi there! I am your Life Companion. How are you holding up today? You can talk to me, ask questions, or directly schedule tasks (e.g. 'schedule Buy groceries tomorrow' or 'add Work out')",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);

    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-chatbot", handleOpen);
    return () => window.removeEventListener("open-chatbot", handleOpen);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Add user message
    setMessages((prev) => [...prev, { sender: "user", text: userText, timestamp }]);
    setInputValue("");
    setIsTyping(true);

    // 2. Process companion response (simulating warm AI)
    setTimeout(async () => {
      let reply = "";
      const lower = userText.toLowerCase();

      if (lower.startsWith("schedule ") || lower.startsWith("add ")) {
        // Task scheduling command
        const titlePart = userText.replace(/^(schedule|add)\s+/i, "");
        if (titlePart) {
          try {
            const newTask: Task = {
              id: `task_${Date.now()}`,
              title: titlePart,
              description: "Added directly via Companion Chat.",
              importance: true,
              urgency: false,
              priorityScore: 70,
              status: "pending",
              estimatedDuration: 45,
              actualDuration: 0,
              deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              energyRequired: "medium",
              dependencies: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await saveTask(newTask);
            
            // Dispatch custom event to trigger page state updates if dashboard is open
            window.dispatchEvent(new Event("task-added"));

            reply = `Task "${titlePart}" has been successfully added to your companion schedule! You'll see it updated in your queue.`;
          } catch (e) {
            reply = "I had trouble saving that task. Could you try again?";
          }
        } else {
          reply = "Please specify a task title! (e.g. 'schedule Water flowers')";
        }
      } else if (lower.includes("hello") || lower.includes("hi ") || lower.includes("hey")) {
        reply = "Hello! I am right here listening. How has your stress level been today?";
      } else if (lower.includes("stressed") || lower.includes("anxious") || lower.includes("overwhelmed") || lower.includes("sad")) {
        reply = "I'm so sorry to hear that. Remember to take a slow, deep breath right now. Hold for 4 seconds, and let it out. I can help organize your day to make it feel lighter.";
      } else if (lower.includes("thank") || lower.includes("thanks")) {
        reply = "Of course! I am here to help you feel calm and clear.";
      } else {
        reply = "I hear you. Balancing life is a journey. Would you like to schedule a task, or simply talk for a bit to clear your mind?";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "companion",
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border border-primary/20"
          title="Talk to Life Companion"
        >
          <IconMessageChatbot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 h-96 bg-card border border-border rounded-[var(--radius)] shadow-2xl flex flex-col overflow-hidden animate-fade-in animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between text-primary-foreground shadow">
            <div className="flex items-center gap-2">
              <IconMessageChatbot className="h-5 w-5" />
              <div className="text-left">
                <span className="text-xs font-bold block leading-none">Life Companion</span>
                <span className="text-[8px] text-primary-foreground/75 leading-none">Always online</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors cursor-pointer"
            >
              <IconX className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-muted/20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-[11px] leading-relaxed text-left ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-muted-foreground mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex flex-col items-start mr-auto max-w-[80%]">
                <div className="bg-card border border-border px-3 py-2 rounded-xl rounded-tl-none text-[11px] text-muted-foreground flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-2 border-t border-border/60 bg-card flex gap-2">
            <input
              type="text"
              placeholder="Talk or type 'schedule...'"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-background border border-border rounded-[calc(var(--radius)-4px)] px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-40 transition-opacity"
            >
              <IconX className="h-4 w-4 rotate-45" /> {/* Simple send pointer */}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
