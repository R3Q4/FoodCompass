import { useState, useEffect } from 'react';
import { InventoryItem, Bid, DonationClaim } from '@/types/inventory';
import { generateAIRecommendation } from '@/lib/aiRecommendation';

const INVENTORY_KEY = 'foodsaver_inventory';
const BIDS_KEY = 'foodsaver_bids';
const DONATIONS_KEY = 'foodsaver_donations';

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [donations, setDonations] = useState<DonationClaim[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedInventory = localStorage.getItem(INVENTORY_KEY);
    const storedBids = localStorage.getItem(BIDS_KEY);
    const storedDonations = localStorage.getItem(DONATIONS_KEY);
    
    if (storedInventory) setInventory(JSON.parse(storedInventory));
    if (storedBids) setBids(JSON.parse(storedBids));
    if (storedDonations) setDonations(JSON.parse(storedDonations));
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'status' | 'aiRecommendation'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    // Generate AI recommendation
    newItem.aiRecommendation = generateAIRecommendation(newItem);
    
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return newItem;
  };

  const updateItemStatus = (itemId: string, status: InventoryItem['status']) => {
    const updatedInventory = inventory.map(item =>
      item.id === itemId ? { ...item, status } : item
    );
    setInventory(updatedInventory);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
  };

  const deleteInventoryItem = (itemId: string) => {
    const updatedInventory = inventory.filter(item => item.id !== itemId);
    setInventory(updatedInventory);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
  };

  const placeBid = (itemId: string, userId: string, userEmail: string, amount: number) => {
    const newBid: Bid = {
      id: crypto.randomUUID(),
      itemId,
      userId,
      userEmail,
      amount,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedBids = [...bids, newBid];
    setBids(updatedBids);
    localStorage.setItem(BIDS_KEY, JSON.stringify(updatedBids));
    return newBid;
  };

  const claimDonation = (itemId: string, userId: string, userEmail: string, quantity: number) => {
    const newClaim: DonationClaim = {
      id: crypto.randomUUID(),
      itemId,
      userId,
      userEmail,
      quantity,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedDonations = [...donations, newClaim];
    setDonations(updatedDonations);
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(updatedDonations));
    return newClaim;
  };

  const updateBidStatus = (bidId: string, status: Bid['status']) => {
    const updatedBids = bids.map(bid =>
      bid.id === bidId ? { ...bid, status } : bid
    );
    setBids(updatedBids);
    localStorage.setItem(BIDS_KEY, JSON.stringify(updatedBids));
  };

  const updateDonationStatus = (claimId: string, status: DonationClaim['status']) => {
    const updatedDonations = donations.map(claim =>
      claim.id === claimId ? { ...claim, status } : claim
    );
    setDonations(updatedDonations);
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(updatedDonations));
  };

  const getBusinessInventory = (businessId: string) => {
    return inventory.filter(item => item.businessId === businessId);
  };

  const getAvailableForBidding = () => {
    return inventory.filter(item => item.status === 'bidding');
  };

  const getAvailableForDonation = () => {
    return inventory.filter(item => item.status === 'donated');
  };

  const getItemBids = (itemId: string) => {
    return bids.filter(bid => bid.itemId === itemId);
  };

  const getItemDonations = (itemId: string) => {
    return donations.filter(claim => claim.itemId === itemId);
  };

  return {
    inventory,
    bids,
    donations,
    addInventoryItem,
    updateItemStatus,
    deleteInventoryItem,
    placeBid,
    claimDonation,
    updateBidStatus,
    updateDonationStatus,
    getBusinessInventory,
    getAvailableForBidding,
    getAvailableForDonation,
    getItemBids,
    getItemDonations,
    loadData
  };
};
