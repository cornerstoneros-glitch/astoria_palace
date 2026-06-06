"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
  options?: { label: string; action: string }[];
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([
          {
            id: 1,
            sender: "bot",
            text: "Bonjour et bienvenue à l'Astoria Palace ! Je suis votre concierge virtuel. Comment puis-je rendre votre séjour exceptionnel ?",
            options: [
              { label: "🏨 Réserver une Chambre", action: "booking" },
              { label: "🍽️ Voir la Gastronomie", action: "restaurant" },
              { label: "📍 Où êtes-vous situés ?", action: "location" },
              { label: "🛎️ Contacter la Réception", action: "contact" }
            ]
          }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOptionClick = (option: { label: string; action: string }) => {
    // Add user message
    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: option.label
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      let botResponse = "";
      let newOptions: { label: string; action: string }[] | undefined = undefined;

      switch (option.action) {
        case "booking":
          botResponse = "Excellent choix. Vous pouvez explorer nos suites luxueuses et vérifier les disponibilités directement dans notre rubrique Hébergements.";
          document.getElementById('chambres')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case "restaurant":
          botResponse = "Notre Chef vous propose un voyage culinaire unique. Découvrez notre carte aux saveurs ivoiriennes et internationales.";
          document.getElementById('gastronomie')?.scrollIntoView({ behavior: 'smooth' });
          break;
        case "location":
          botResponse = "Nous sommes situés en plein cœur de Yopougon, Abidjan, Côte d'Ivoire. Un véritable havre de paix au milieu de la métropole.";
          newOptions = [{ label: "Voir d'autres services", action: "restart" }];
          break;
        case "contact":
          botResponse = "Notre réception est ouverte 24/7. Vous pouvez nous joindre au +225 00 00 00 00 ou par email à contact@astoriapalace.ci.";
          newOptions = [{ label: "Voir d'autres services", action: "restart" }];
          break;
        case "restart":
          botResponse = "Que puis-je faire d'autre pour vous ?";
          newOptions = [
            { label: "🏨 Réserver une Chambre", action: "booking" },
            { label: "🍽️ Voir la Gastronomie", action: "restaurant" },
            { label: "📍 Où êtes-vous situés ?", action: "location" }
          ];
          break;
        default:
          botResponse = "Je n'ai pas bien compris. Que désirez-vous ?";
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: botResponse,
        options: newOptions
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[340px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl mb-4 border border-slate-200 overflow-hidden flex flex-col animate-scaleIn origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-4 flex items-center justify-between text-white border-b-2 border-[#c5a059]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c5a059] flex items-center justify-center shadow-lg border border-[#d4af37]">
                <span className="text-sm">🛎️</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm tracking-wide">Astoria Concierge</h3>
                <p className="text-[9px] text-[#c5a059] uppercase tracking-widest font-bold">En ligne</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-slate-900 text-white rounded-br-sm" 
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.options && msg.sender === "bot" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(opt)}
                        disabled={isTyping}
                        className="px-3 py-1.5 rounded-full text-xs font-bold border border-[#c5a059]/40 bg-[#c5a059]/5 text-[#b08b45] hover:bg-[#c5a059] hover:text-white transition-all text-left shadow-sm hover:shadow disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-[#c5a059] to-[#d4af37] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white/20 relative group"
      >
        <span className="text-2xl drop-shadow-md">🛎️</span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
}
