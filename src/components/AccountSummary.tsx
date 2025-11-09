import { Card } from "@/components/ui/card";
import { CardBrandLogo } from "@/components/CardBrandLogo";
import { Progress } from "@/components/ui/progress";
import { CreditCard } from "@/components/CreditCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, CreditCard as CreditCardIcon, AlertCircle, Award, Percent, Clock } from "lucide-react";
import visaCard from "@/assets/card-visa.jpg";
import mastercardCard from "@/assets/card-mastercard.jpg";
import amexCard from "@/assets/card-amex.jpg";
import discoverCard from "@/assets/card-discover.jpg";
import visaCardBack from "@/assets/card-back-visa.jpg";
import mastercardCardBack from "@/assets/card-back-mastercard.jpg";
import amexCardBack from "@/assets/card-back-amex.jpg";
import discoverCardBack from "@/assets/card-back-discover.jpg";

interface CardData {
  id: string;
  card_name: string;
  card_type: string;
  balance: number;
  gradient: string;
  credit_limit: number;
  annual_fee: number;
  cashback: number;
  pending_dues: number;
  card_image_url?: string;
  last_four: string;
  apr?: number;
  due_date?: string;
  rewards_type?: string;
}

interface AccountSummaryProps {
  cards: CardData[];
}

export const AccountSummary = ({ cards }: AccountSummaryProps) => {
  // Calculate metrics from actual card data
  const totalCards = cards.length;
  const totalBalance = cards.reduce((sum, card) => sum + Number(card.balance), 0);
  const totalCreditLimit = cards.reduce((sum, card) => sum + Number(card.credit_limit || 0), 0);
  const totalAnnualFees = cards.reduce((sum, card) => sum + Number(card.annual_fee || 0), 0);
  const totalCashback = cards.reduce((sum, card) => sum + Number(card.cashback || 0), 0);
  const totalPendingDues = cards.reduce((sum, card) => sum + Number(card.pending_dues || 0), 0);
  const avgUtilization = totalCreditLimit > 0 ? Math.round((totalBalance / totalCreditLimit) * 100) : 0;
  
  // Calculate available credit (this is the key metric)
  const usedCredit = totalBalance;
  const availableCredit = totalCreditLimit - totalBalance;
  
  // Helper function to get card status
  const getCardStatus = (card: CardData) => {
    const utilization = Number(card.credit_limit) > 0 ? (Number(card.balance) / Number(card.credit_limit)) * 100 : 0;
    const dueDate = card.due_date ? new Date(card.due_date) : null;
    const daysUntilDue = dueDate ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    if (daysUntilDue !== null && daysUntilDue <= 7) {
      return { label: 'Payment Due Soon', color: 'bg-red-500', textColor: 'text-red-600' };
    } else if (utilization > 70) {
      return { label: 'High Utilization', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    } else {
      return { label: 'Safe', color: 'bg-green-500', textColor: 'text-green-600' };
    }
  };

  // Helper function to get card image based on type
  const getCardImage = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type.includes('visa')) return visaCard;
    if (type.includes('mastercard')) return mastercardCard;
    if (type.includes('amex') || type.includes('american express')) return amexCard;
    if (type.includes('discover')) return discoverCard;
    return visaCard; // default
  };

  // Helper function to get card back image based on type
  const getCardBackImage = (cardType: string) => {
    const type = cardType.toLowerCase();
    if (type.includes('visa')) return visaCardBack;
    if (type.includes('mastercard')) return mastercardCardBack;
    if (type.includes('amex') || type.includes('american express')) return amexCardBack;
    if (type.includes('discover')) return discoverCardBack;
    return visaCardBack; // default
  };

  if (cards.length === 0) {
    return (
      <Card className="shadow-card">
        <div className="p-6">
          <p className="text-center text-muted-foreground py-8">No cards added yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Summary - Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-elevated bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="p-6">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <DollarSign className="h-5 w-5" />
              <p className="text-sm font-semibold">Available Credit</p>
            </div>
            <p className="text-4xl font-bold text-foreground">${availableCredit.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">Ready to use</p>
          </div>
        </Card>

        <Card className="shadow-elevated bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="p-6">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <CreditCardIcon className="h-5 w-5" />
              <p className="text-sm font-semibold">Used Credit</p>
            </div>
            <p className="text-4xl font-bold text-foreground">${usedCredit.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">Current balance</p>
          </div>
        </Card>

        <Card className="shadow-elevated bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <div className="p-6">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <Percent className="h-5 w-5" />
              <p className="text-sm font-semibold">Utilization</p>
            </div>
            <p className="text-4xl font-bold text-foreground">{avgUtilization}%</p>
            <div className="mt-3">
              <Progress value={avgUtilization} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Linked Cards List */}
      <Card className="shadow-card">
        <div className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-6">Your Cards</h3>
          <div className="space-y-4">
            {cards.map((card) => {
              const utilization = Number(card.credit_limit) > 0 ? Math.round((Number(card.balance) / Number(card.credit_limit)) * 100) : 0;
              const status = getCardStatus(card);
              const dueDate = card.due_date ? new Date(card.due_date).toLocaleDateString() : 'Not set';
              
              return (
                <div key={card.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Card Image with Flip Animation */}
                    <div className="flex-shrink-0 perspective-1000">
                      <div className="card-flip-container group">
                        {/* Front of Card */}
                        <div className="card-flip-front">
                          <img 
                            src={getCardImage(card.card_type)} 
                            alt={card.card_name}
                            className="w-64 h-40 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                        {/* Back of Card */}
                        <div className="card-flip-back">
                          <img 
                            src={getCardBackImage(card.card_type)} 
                            alt={`${card.card_name} back`}
                            className="w-64 h-40 object-cover rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-bold text-foreground">{card.card_name}</h4>
                            <span className="text-sm text-muted-foreground">••••  {card.last_four}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{card.card_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                          <span className={`text-sm font-semibold ${status.textColor}`}>{status.label}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Balance</p>
                          <p className="text-lg font-bold text-foreground">${Number(card.balance).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">APR</p>
                          <p className="text-lg font-bold text-foreground">{Number(card.apr || 0).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="text-lg font-bold text-foreground">{dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rewards</p>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-green-600" />
                            <p className="text-lg font-bold text-green-600 capitalize">
                              {card.rewards_type || 'cashback'}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">${(Number(card.balance) * 0.02).toFixed(2)} est.</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Utilization</span>
                          <span className={`font-semibold ${utilization > 70 ? 'text-red-600' : utilization > 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {utilization}%
                          </span>
                        </div>
                        <Progress value={utilization} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Rewards</p>
                <p className="text-2xl font-bold text-green-600">${totalCashback.toLocaleString()}</p>
              </div>
              <Award className="h-10 w-10 text-green-600/20" />
            </div>
          </div>
        </Card>

        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Dues</p>
                <p className="text-2xl font-bold text-foreground">${totalPendingDues.toLocaleString()}</p>
              </div>
              <Clock className="h-10 w-10 text-amber-600/20" />
            </div>
          </div>
        </Card>

        <Card className="shadow-card">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Annual Fees</p>
                <p className="text-2xl font-bold text-foreground">${totalAnnualFees.toLocaleString()}</p>
              </div>
              <CreditCardIcon className="h-10 w-10 text-muted-foreground/20" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
