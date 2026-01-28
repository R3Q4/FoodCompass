import { InventoryItem, AIRecommendation } from "@/types/inventory";

export const generateAIRecommendation = (item: InventoryItem): AIRecommendation => {
  const today = new Date();
  const expiryDate = new Date(item.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Urgency level
  let urgencyLevel: AIRecommendation['urgencyLevel'];
  if (daysUntilExpiry <= 0) urgencyLevel = 'critical';
  else if (daysUntilExpiry <= 3) urgencyLevel = 'high';
  else if (daysUntilExpiry <= 7) urgencyLevel = 'medium';
  else urgencyLevel = 'low';

  // Strategy
  let strategy: AIRecommendation['strategy'];
  let confidence: number;
  let suggestedPrice: number | undefined;
  let reasoning: string;

  if (daysUntilExpiry <= 0) {
    // Expired items must be disposed
    strategy = 'dispose';
    confidence = 1;
    reasoning = "Item has expired and must be disposed immediately for safety.";
  } else if (daysUntilExpiry <= 1) {
    strategy = 'donation';
    confidence = 0.95;
    reasoning = `With only ${daysUntilExpiry} day(s) until expiry, donation is recommended to prevent food waste.`;
  } else if (daysUntilExpiry <= 3) {
    if (item.quantity > 50) {
      strategy = 'bidding';
      confidence = 0.85;
      reasoning = `High quantity (${item.quantity}) and short expiry — open for bidding to maximize recovery.`;
    } else {
      strategy = 'price_reduction';
      confidence = 0.88;
      suggestedPrice = item.originalPrice * 0.4;
      reasoning = `Aggressive 60% discount recommended to sell quickly.`;
    }
  } else if (daysUntilExpiry <= 7) {
    strategy = 'price_reduction';
    confidence = 0.82;
    suggestedPrice = item.originalPrice * 0.7;
    reasoning = `Moderate 30% discount to accelerate sales.`;
  } else {
    if (item.quantity > 100) {
      strategy = 'bidding';
      confidence = 0.75;
      reasoning = "Large inventory with enough time — open for competitive bidding.";
    } else {
      strategy = 'price_reduction';
      confidence = 0.7;
      suggestedPrice = item.originalPrice * 0.85;
      reasoning = "Small discount to move inventory steadily over time.";
    }
  }

  return { strategy, confidence, suggestedPrice, reasoning, urgencyLevel };
};

export const getStrategyLabel = (strategy: AIRecommendation['strategy']): string => {
  switch (strategy) {
    case 'price_reduction': return 'Price Reduction';
    case 'donation': return 'Donation';
    case 'bidding': return 'Open Bidding';
    case 'dispose': return 'Dispose';
    default: return 'Unknown';
  }
};

export const getUrgencyColor = (urgency: AIRecommendation['urgencyLevel']): string => {
  switch (urgency) {
    case 'critical': return 'text-red-600 bg-red-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'low': return 'text-green-600 bg-green-100';
    default: return 'text-muted-foreground bg-muted';
  }
};
