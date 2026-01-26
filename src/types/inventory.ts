export interface InventoryItem {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  originalPrice: number;
  expiryDate: string;
  location: string;
  createdAt: string;
  status: 'active' | 'reduced' | 'donated' | 'bidding' | 'sold';
  aiRecommendation?: AIRecommendation;
}

export interface AIRecommendation {
  strategy: 'price_reduction' | 'donation' | 'bidding';
  confidence: number;
  suggestedPrice?: number;
  reasoning: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Bid {
  id: string;
  itemId: string;
  userId: string;
  userEmail: string;
  amount: number;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DonationClaim {
  id: string;
  itemId: string;
  userId: string;
  userEmail: string;
  quantity: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'collected';
}
