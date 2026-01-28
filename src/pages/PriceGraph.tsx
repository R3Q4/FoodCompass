import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PriceGraphProps {
  originalPrice: number;
  aiSuggestedPrice?: number;
  currentPrice: number;
}

interface ChartData {
  discount: number;
  price: number;
  chance: number;
}

const PriceGraph: React.FC<PriceGraphProps> = ({ originalPrice, aiSuggestedPrice, currentPrice }) => {
  // Generate chart data dynamically
  const data: ChartData[] = useMemo(() => {
    const chartData: ChartData[] = [];
    const maxDiscount = 50; // 0% - 50%
    for (let discount = 0; discount <= maxDiscount; discount += 5) {
      const price = originalPrice * (1 - discount / 100);
      // Example formula: higher discount = higher chance of selling
      let baseChance = 50;
      const aiFactor = aiSuggestedPrice ? Math.max(0, 100 - (price / aiSuggestedPrice) * 100) : 0;
      const chance = Math.min(100, baseChance + discount * 1.2 + aiFactor * 0.5);
      chartData.push({ discount, price, chance: Math.round(chance) });
    }
    return chartData;
  }, [originalPrice, aiSuggestedPrice]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-medium text-lg">Discount vs Sell Probability</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis
            dataKey="discount"
            label={{ value: "Discount %", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "Sell Probability %", angle: -90, position: "insideLeft" }}
            domain={[0, 100]}
          />
          <Tooltip
            formatter={(value: any, name: string) =>
              name === "price" ? `$${value.toFixed(2)}` : `${value}%`
            }
          />
          <Line type="monotone" dataKey="chance" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-muted-foreground">
        Moving the price changes the discount and estimated chance to sell all surplus.
      </p>
    </div>
  );
};

export default PriceGraph;
