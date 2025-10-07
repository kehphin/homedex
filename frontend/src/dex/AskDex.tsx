import React, { useState, useRef, useEffect } from "react";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  LightBulbIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AskDex() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // TODO: Replace with actual API call
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm Dex, your home assistant! I'm currently in development, but soon I'll be able to help you with all your home maintenance questions, scheduling, and more. Stay tuned!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    {
      icon: WrenchScrewdriverIcon,
      text: "When should I replace my HVAC filter?",
      color: "text-blue-500",
    },
    {
      icon: CalendarIcon,
      text: "Schedule a maintenance appointment",
      color: "text-green-500",
    },
    {
      icon: LightBulbIcon,
      text: "Tips for reducing my energy bills",
      color: "text-yellow-500",
    },
    {
      icon: HomeIcon,
      text: "What tasks should I do this month?",
      color: "text-purple-500",
    },
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-gradient-to-br from-primary to-secondary text-neutral-content rounded-full w-10">
              <SparklesIcon className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Ask Dex™
            </h1>
            <p className="text-sm text-base-content/60">
              Your intelligent home assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="avatar placeholder mb-6">
                <div className="bg-gradient-to-br from-primary to-secondary text-neutral-content rounded-full w-20">
                  <SparklesIcon className="h-12 w-12" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-center">
                Welcome to Ask Dex™
              </h2>
              <p className="text-lg text-base-content/70 mb-8 text-center max-w-2xl">
                Your AI-powered home assistant. Ask me anything about your home
                maintenance, schedules, tasks, or get personalized
                recommendations!
              </p>

              {/* Suggested Questions */}
              <div className="w-full max-w-2xl">
                <h3 className="text-sm font-semibold text-base-content/60 mb-3 px-2">
                  Try asking:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question.text)}
                      className="btn btn-outline justify-start text-left h-auto py-4 px-4 hover:bg-base-300 transition-all"
                    >
                      <question.icon
                        className={`h-5 w-5 ${question.color} flex-shrink-0`}
                      />
                      <span className="flex-1">{question.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${
                    message.role === "user" ? "chat-end" : "chat-start"
                  }`}
                >
                  <div className="chat-image avatar">
                    <div
                      className={`w-10 rounded-full ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-primary to-secondary"
                          : "bg-base-300"
                      } flex items-center justify-center`}
                    >
                      {message.role === "assistant" ? (
                        <SparklesIcon className="h-6 w-6 text-neutral-content" />
                      ) : (
                        <div className="text-base-content text-sm font-bold">
                          You
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="chat-header mb-1">
                    {message.role === "assistant" ? "Dex" : "You"}
                    <time className="text-xs opacity-50 ml-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble ${
                      message.role === "user"
                        ? "chat-bubble-primary"
                        : "chat-bubble-secondary"
                    } whitespace-pre-wrap`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="chat chat-start">
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <SparklesIcon className="h-6 w-6 text-neutral-content" />
                    </div>
                  </div>
                  <div className="chat-header mb-1">Dex</div>
                  <div className="chat-bubble chat-bubble-secondary">
                    <div className="flex gap-1">
                      <span className="loading loading-dots loading-sm"></span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-base-100 border-t border-base-300 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Dex anything about your home..."
              className="textarea textarea-bordered flex-1 resize-none min-h-[3rem] max-h-32 pr-12"
              rows={1}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="btn btn-primary btn-circle btn-sm absolute right-2 bottom-2"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-base-content/50 mt-2 text-center">
            Dex can make mistakes. Please verify important information.
          </p>
        </form>
      </div>
    </div>
  );
}
