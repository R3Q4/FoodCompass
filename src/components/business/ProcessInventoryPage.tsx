import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const ProcessInventoryPage = () => {
  const [inventoryList, setInventoryList] = useState<any[]>([]);

  useEffect(() => {
    const savedList = JSON.parse(sessionStorage.getItem("inventoryList") || "[]");
    setInventoryList(savedList);
  }, []);

  const handleClear = () => {
    sessionStorage.removeItem("inventoryList");
    setInventoryList([]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory to Process</h1>

      {inventoryList.length === 0 ? (
        <p>No items found</p>
      ) : (
        <ul className="list-disc pl-5 space-y-2 mb-4">
          {inventoryList.map((item, idx) => (
            <li key={idx} className="border p-2 rounded">
              <p><strong>{item.name}</strong> - {item.quantity} {item.unit}</p>
              <p>Price: ${item.originalPrice} | Category: {item.category}</p>
              <p>Expiry: {item.expiryDate} | Location: {item.location}</p>
              <p>Business: {item.businessName}</p>
              {item.description && <p>Context: {item.description}</p>}
            </li>
          ))}
        </ul>
      )}

      {inventoryList.length > 0 && (
        <Button variant="destructive" onClick={handleClear}>
          Clear All
        </Button>
      )}
    </div>
  );
};

export default ProcessInventoryPage;
