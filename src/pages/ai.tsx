import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  originalPrice: number;
  category: string;
  expiryDate: string;
  location: string;
  businessName: string;
  description?: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIProps {
  inventoryItem: InventoryItem;
  onClose: () => void;
}

// Gemini setup
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function AI({ inventoryItem, onClose }: AIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<any>(null);

  // Initialize chat and send initial prompt
  useEffect(() => {
    const initChat = async () => {
      try {
        const chatInstance = await model.startChat({
          history: [],
          generationConfig: { maxOutputTokens: 2000 },
        });
        setChat(chatInstance);

        // Initial hidden prompt
        const initialPrompt = `
You are an assistant advising a business on reducing food waste and maximizing revenue. 
Using the following item details, provide a short explanation why lowering the price is a smart decision for this particular business:
Answer in this format: recommended percentage discount, reason on a new line
Item details:
- Name: ${inventoryItem.name}
- Quantity: ${inventoryItem.quantity} ${inventoryItem.unit}
- Original Price: $${inventoryItem.originalPrice}
- Category: ${inventoryItem.category}
- Expiry Date: ${inventoryItem.expiryDate}
- Location: ${inventoryItem.location}
- Business: ${inventoryItem.businessName}
- Description: ${inventoryItem.description || "N/A"}
        `;
        fetchAIResponse(initialPrompt, chatInstance);
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };

    initChat();
  }, [inventoryItem]);

  // Fetch AI response
  const fetchAIResponse = async (prompt: string, chatInstance?: any) => {
    const activeChat = chatInstance || chat;
    if (!activeChat) return;

    setIsLoading(true);
    try {
      const result = await activeChat.sendMessage(prompt);
      const responseText = result.response.text();

      setMessages(prev => [
        ...prev,
        { id: Date.now(), role: "assistant", content: responseText, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          content: "Sorry, I couldn’t generate advice right now.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle user input
  const handleUserQuestion = async () => {
    if (!inputValue.trim() || isLoading || !chat) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await chat.sendMessage(userMessage.content);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.response.text(),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I couldn’t generate advice.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 w-full relative">
      <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>

      <h2 className="text-lg font-semibold mb-3">AI Price Advisor for {inventoryItem.name}</h2>

      <ScrollArea className="h-[260px] mb-3">
        <div className="space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`p-3 rounded ${m.role === "assistant" ? "bg-accent/10" : "bg-primary/10"}`}
            >
              {m.content}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask a follow-up question…"
          onKeyDown={e => e.key === "Enter" && handleUserQuestion()}
        />
        <Button onClick={handleUserQuestion} disabled={isLoading}>
          Send
        </Button>
      </div>
    </Card>
  );
}
