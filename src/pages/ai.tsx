import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
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

// Gemini setup
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default function AI() {
  const { itemId } = useParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasInitialized = useRef(false);

  const chatRef = useRef(
    model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 500 },
    })
  );

  // Load item
  useEffect(() => {
    const inventory: InventoryItem[] = JSON.parse(
      sessionStorage.getItem("inventoryList") || "[]"
    );
    const found = inventory.find(i => i.id === itemId);
    setItem(found || null);
  }, [itemId]);

  // Initial AI prompt (only runs once)
  useEffect(() => {
    if (!item || hasInitialized.current) return;
    hasInitialized.current = true;

    // Compose default system message
    const defaultPrompt = `
You are a helpful assistant advising a business on reducing food waste and maximizing recovery.
Using the following item details, provide a short explanation why lowering the price is a smart decision:

Item details:
- Name: ${item.name}
- Quantity: ${item.quantity} ${item.unit}
- Original Price: $${item.originalPrice}
- Category: ${item.category}
- Expiry Date: ${item.expiryDate}
- Location: ${item.location}
- Business: ${item.businessName}
- Description: ${item.description || "N/A"}
`;

    sendMessage(defaultPrompt, "user");
  }, [item]);

  // Send message function
  const sendMessage = async (text: string, role: "user" | "assistant" = "user") => {
    if (!text.trim() || isLoading) return;

    // Add user's message first (or system-preloaded)
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role, content: text, timestamp: new Date() },
    ]);

    if (role === "assistant") return; // skip API call for assistant-preloaded messages

    setIsLoading(true);
    setInputValue("");

    try {
      const result = await chatRef.current.sendMessage(text);
      const responseText = result.response.text();

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Gemini error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I couldn’t generate advice right now.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 w-full">
      <h2 className="text-lg font-semibold mb-3">AI Price Advisor</h2>

      <ScrollArea className="h-[260px] mb-3">
        <div className="space-y-3">
          {messages.map(m => (
            <div
              key={m.id}
              className={`p-3 rounded ${
                m.role === "assistant" ? "bg-accent/10" : "bg-primary/10"
              }`}
            >
              {m.content}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Ask a follow-up question…"
          onKeyDown={e => e.key === "Enter" && sendMessage(inputValue)}
        />
        <Button onClick={() => sendMessage(inputValue)} disabled={isLoading}>
          Send
        </Button>
      </div>
    </Card>
  );
}
