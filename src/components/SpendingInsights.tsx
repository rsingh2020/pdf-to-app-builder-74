import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Award, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff6b9d", "#c0c0ff", "#a4de6c", "#d0ed57", "#83a6ed", "#8dd1e1", "#d084d0", "#ffa07a", "#98d8c8", "#f6b93b", "#e67e22", "#9b59b6", "#3498db"];

interface SpendingData {
  name: string;
  value: number;
  rewards: number;
}

interface TopCard {
  card_name: string;
  total_spent: number;
  total_rewards: number;
  percentage: number;
}

interface CardChartData {
  name: string;
  spent: number;
  rewards: number;
}

export const SpendingInsights = () => {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [topCards, setTopCards] = useState<TopCard[]>([]);
  const [allCardsData, setAllCardsData] = useState<CardChartData[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch category spending
      const { data: categoryData } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user.id);

      if (categoryData) {
        const categoryTotals = categoryData.reduce((acc: any, txn) => {
          const cat = txn.category;
          if (!acc[cat]) acc[cat] = 0;
          acc[cat] += Number(txn.amount);
          return acc;
        }, {});

        const formattedData: SpendingData[] = Object.entries(categoryTotals)
          .map(([name, value]) => ({
            name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: Number(value),
            rewards: Number(value) * 0.02 // Estimated 2% average
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setSpendingData(formattedData);
        const total = formattedData.reduce((sum, item) => sum + item.value, 0);
        const rewards = formattedData.reduce((sum, item) => sum + item.rewards, 0);
        setTotalSpend(total);
        setTotalRewards(rewards);
      }

      // Fetch top cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('id, card_name')
        .eq('user_id', user.id);

      if (cardsData) {
        const cardStats = await Promise.all(
          cardsData.map(async (card) => {
            const { data: txns } = await supabase
              .from('transactions')
              .select('amount')
              .eq('card_id', card.id)
              .eq('user_id', user.id);

            const spent = txns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
            return {
              card_name: card.card_name,
              total_spent: spent,
              total_rewards: spent * 0.02,
              percentage: 0
            };
          })
        );

        const totalSpending = cardStats.reduce((sum, c) => sum + c.total_spent, 0);
        
        // Sort and prepare data for charts
        const sortedStats = cardStats
          .map(c => ({
            ...c,
            percentage: totalSpending > 0 ? (c.total_spent / totalSpending) * 100 : 0
          }))
          .sort((a, b) => b.total_spent - a.total_spent);

        // Top 3 for list
        setTopCards(sortedStats.slice(0, 3));

        // All cards for chart (filter out cards with no spending)
        const chartData: CardChartData[] = sortedStats
          .filter(c => c.total_spent > 0)
          .map(c => ({
            name: c.card_name.length > 20 ? c.card_name.substring(0, 20) + '...' : c.card_name,
            spent: Number(c.total_spent.toFixed(2)),
            rewards: Number(c.total_rewards.toFixed(2))
          }));

        setAllCardsData(chartData);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading insights...</div>;
  }
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs font-medium">Total Spent This Month</p>
            </div>
            <p className="text-2xl font-bold text-foreground">${totalSpend.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Recent spending</p>
          </div>
        </Card>

        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Award className="h-4 w-4" />
              <p className="text-xs font-medium">Rewards Earned</p>
            </div>
            <p className="text-2xl font-bold text-green-600">${totalRewards.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {totalSpend > 0 ? ((totalRewards / totalSpend) * 100).toFixed(2) : '0.00'}% rate
            </p>
          </div>
        </Card>

        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs font-medium">Missed Opportunities</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">$23.00</p>
            <p className="text-xs text-muted-foreground mt-1">Use better cards!</p>
          </div>
        </Card>
      </div>

      {/* Spending by Category */}
      <Card className="shadow-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {spendingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `$${Number(value).toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top 10 Cards Chart */}
      {allCardsData.length > 0 && (
        <Card className="shadow-card">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Top 10 Cards by Spending
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Your most used cards ranked by total spending
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={allCardsData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Spending ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="spent" radius={[8, 8, 0, 0]}>
                  {allCardsData.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top 3 Cards List */}
      <Card className="shadow-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Most Effective Cards
          </h3>
          <div className="space-y-3">
            {topCards.length > 0 ? topCards.map((card, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{card.card_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {card.percentage.toFixed(1)}% of spending
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${card.total_rewards.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">earned</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No transaction data yet</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};