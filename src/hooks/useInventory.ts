import { useState, useEffect } from 'react';
import { InventoryItem, Bid, DonationClaim } from '@/types/inventory';
import { generateAIRecommendation } from '@/lib/aiRecommendation';

/* ------------------ Storage Keys ------------------ */

const INVENTORY_KEY = 'foodsaver_inventory';
const BIDS_KEY = 'foodsaver_bids';
const DONATIONS_KEY = 'foodsaver_donations';

/* ------------------ User Transaction Types ------------------ */

export type UserTransactionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'won';

export type UserTransaction = {
  id: string;
  itemId: string;
  itemName: string;
  type: 'bid' | 'donation';
  amount?: number;
  quantity?: number;
  status: UserTransactionStatus;
  createdAt: string;
};

/* ------------------ Hook ------------------ */

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [donations, setDonations] = useState<DonationClaim[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  /* ------------------ Load / Save ------------------ */

  const loadData = () => {
    const storedInventory = localStorage.getItem(INVENTORY_KEY);
    const storedBids = localStorage.getItem(BIDS_KEY);
    const storedDonations = localStorage.getItem(DONATIONS_KEY);

    if (storedInventory) setInventory(JSON.parse(storedInventory));
    if (storedBids) setBids(JSON.parse(storedBids));
    if (storedDonations) setDonations(JSON.parse(storedDonations));
  };

  /* ------------------ Inventory ------------------ */
  const updateInventoryItem = (updatedItem: InventoryItem) => {
    const updatedInventory = inventory.map(item =>
      item.id === updatedItem.id ? { ...item, ...updatedItem } : item
    );
    setInventory(updatedInventory);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
  };


  const addInventoryItem = (
    item: Omit<InventoryItem, 'id' | 'createdAt' | 'status' | 'aiRecommendation'>
  ) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active',
      aiRecommendation: generateAIRecommendation(item as InventoryItem)
    };

    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return newItem;
  };

  const updateItemStatus = (
    itemId: string,
    status: InventoryItem['status']
  ) => {
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

  /* ------------------ Bids ------------------ */

  const placeBid = (
    itemId: string,
    userId: string,
    userEmail: string,
    amount: number
  ) => {
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

  const updateBidStatus = (bidId: string, status: Bid['status']) => {
    const updatedBids = bids.map(bid =>
      bid.id === bidId ? { ...bid, status } : bid
    );
    setBids(updatedBids);
    localStorage.setItem(BIDS_KEY, JSON.stringify(updatedBids));
  };

  /* ------------------ Donations ------------------ */

  const claimDonation = (
    itemId: string,
    userId: string,
    userEmail: string,
    quantity: number
  ) => {
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

  const updateDonationStatus = (
    claimId: string,
    status: DonationClaim['status']
  ) => {
    const updatedDonations = donations.map(claim =>
      claim.id === claimId ? { ...claim, status } : claim
    );
    setDonations(updatedDonations);
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(updatedDonations));
  };

  /* ------------------ Queries ------------------ */

  const getBusinessInventory = (businessId: string) =>
    inventory.filter(item => item.businessId === businessId);

  const getAvailableForBidding = () =>
    inventory.filter(item => item.status === 'bidding');

  const getAvailableForDonation = () =>
    inventory.filter(item => item.status === 'donated');

  const getItemBids = (itemId: string) =>
    bids.filter(bid => bid.itemId === itemId);

  const getItemDonations = (itemId: string) =>
    donations.filter(claim => claim.itemId === itemId);

  /* ------------------ Status Normalization ------------------ */

  const normalizeBidStatus = (
    status: Bid['status']
  ): UserTransactionStatus => {
    switch (status) {
      case 'accepted':
        return 'won';
      case 'rejected':
        return 'rejected';
      case 'pending':
      default:
        return 'pending';
    }
  };

  const normalizeDonationStatus = (
    status: DonationClaim['status']
  ): UserTransactionStatus => {
    switch (status) {
      case 'approved':
      case 'collected':
        return 'approved';
      case 'pending':
      default:
        return 'pending';
    }
  };

  /* ------------------ User Transactions ------------------ */

  const getUserTransactions = (userId: string): UserTransaction[] => {
    const bidTransactions: UserTransaction[] = bids
      .filter(bid => bid.userId === userId)
      .map(bid => {
        const item = inventory.find(i => i.id === bid.itemId);
        return {
          id: bid.id,
          itemId: bid.itemId,
          itemName: item?.name ?? 'Unknown Item',
          type: 'bid',
          amount: bid.amount,
          status: normalizeBidStatus(bid.status),
          createdAt: bid.createdAt
        };
      });

    const donationTransactions: UserTransaction[] = donations
      .filter(claim => claim.userId === userId)
      .map(claim => {
        const item = inventory.find(i => i.id === claim.itemId);
        return {
          id: claim.id,
          itemId: claim.itemId,
          itemName: item?.name ?? 'Unknown Item',
          type: 'donation',
          quantity: claim.quantity,
          status: normalizeDonationStatus(claim.status),
          createdAt: claim.createdAt
        };
      });

    return [...bidTransactions, ...donationTransactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
  };

  /* ------------------ Public API ------------------ */

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
    getUserTransactions,
    loadData
  };
};
