import { InventoryItem, AIRecommendation } from '@/types/inventory';

export const generateAIRecommendation = (item: InventoryItem): AIRecommendation => {
  const today = new Date();
  const expiryDate = new Date(item.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate urgency level
  let urgencyLevel: AIRecommendation['urgencyLevel'];
  if (daysUntilExpiry <= 1) {
    urgencyLevel = 'critical';
  } else if (daysUntilExpiry <= 3) {
    urgencyLevel = 'high';
  } else if (daysUntilExpiry <= 7) {
    urgencyLevel = 'medium';
  } else {
    urgencyLevel = 'low';
  }

  // Determine strategy based on various factors
  let strategy: AIRecommendation['strategy'];
  let confidence: number;
  let suggestedPrice: number | undefined;
  let reasoning: string;

  if (daysUntilExpiry <= 1) {
    // Critical - donate to avoid waste
    strategy = 'donation';
    confidence = 0.95;
    reasoning = `With only ${daysUntilExpiry} day(s) until expiry, donation is recommended to prevent food waste and support the community. This also provides tax benefits.`;
  } else if (daysUntilExpiry <= 3) {
    // High urgency - aggressive price reduction or bidding
    if (item.quantity > 50) {
      strategy = 'bidding';
      confidence = 0.85;
      reasoning = `High quantity (${item.quantity} ${item.unit}) with ${daysUntilExpiry} days until expiry. Bidding can attract bulk buyers and maximize recovery value.`;
    } else {
      strategy = 'price_reduction';
      confidence = 0.88;
      suggestedPrice = item.originalPrice * 0.4;
      reasoning = `With ${daysUntilExpiry} days until expiry, a 60% discount is recommended to drive quick sales and minimize loss.`;
    }
  } else if (daysUntilExpiry <= 7) {
    // Medium urgency - moderate price reduction
    strategy = 'price_reduction';
    confidence = 0.82;
    suggestedPrice = item.originalPrice * 0.7;
    reasoning = `${daysUntilExpiry} days until expiry allows for a strategic 30% discount to accelerate sales while maintaining reasonable margins.`;
  } else {
    // Low urgency - consider bidding for premium recovery
    if (item.quantity > 100) {
      strategy = 'bidding';
      confidence = 0.75;
      reasoning = `Large inventory with ample time allows for competitive bidding to potentially recover more value than standard discounting.`;
    } else {
      strategy = 'price_reduction';
      confidence = 0.7;
      suggestedPrice = item.originalPrice * 0.85;
      reasoning = `Early action with a 15% discount can help move inventory steadily before urgency increases.`;
    }
  }

  return {
    strategy,
    confidence,
    suggestedPrice,
    reasoning,
    urgencyLevel
  };
};

export const getStrategyLabel = (strategy: AIRecommendation['strategy']): string => {
  switch (strategy) {
    case 'price_reduction':
      return 'Price Reduction';
    case 'donation':
      return 'Donation';
    case 'bidding':
      return 'Open Bidding';
    default:
      return 'Unknown';
  }
};

export const getUrgencyColor = (urgency: AIRecommendation['urgencyLevel']): string => {
  switch (urgency) {
    case 'critical':
      return 'text-red-600 bg-red-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'low':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-muted-foreground bg-muted';
  }
};
