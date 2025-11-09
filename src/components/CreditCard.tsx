import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard as CreditCardIcon, Eye, EyeOff } from "lucide-react";
import { CardBrandLogo } from "./CardBrandLogo";
import { EMVChip } from "./EMVChip";

interface CreditCardProps {
  cardName: string;
  cardType: string;
  balance: number;
  gradient?: string;
  isStacked?: boolean;
  isActive?: boolean;
}

export const CreditCard = ({ 
  cardName, 
  cardType, 
  balance,
  gradient,
  isStacked = false,
  isActive = true
}: CreditCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  // Auto-select gradient based on card type
  const getGradientClass = () => {
    if (gradient) return `bg-gradient-card-${gradient}`;
    
    const type = cardType.toLowerCase();
    if (type.includes('american express') || type.includes('amex')) return 'bg-gradient-card-amex';
    if (type.includes('visa')) return 'bg-gradient-card-visa';
    if (type.includes('mastercard')) return 'bg-gradient-card-mastercard';
    if (type.includes('discover')) return 'bg-gradient-card-discover';
    if (type.includes('apple')) return 'bg-gradient-card-apple';
    return 'bg-gradient-card-other';
  };

  const gradientClass = getGradientClass();

  return (
    <Card className={`${gradientClass} relative overflow-hidden border-2 border-[#D4AF37] text-black shadow-elevated ${isStacked ? 'pointer-events-auto' : ''} ${isActive ? 'shadow-elevated' : 'shadow-card'}`}>
      {/* Subtle overlay for depth and premium feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-white/10"></div>
      {/* Noise texture for authenticity */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      
      <div className="relative p-6 space-y-6">
        {/* Card Header with Brand Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardBrandLogo brand={cardType} className="h-8 text-black drop-shadow-lg" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="text-black hover:bg-black/10"
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>

        {/* EMV Chip */}
        <div className="flex items-start">
          <EMVChip className="w-14 h-11" />
        </div>

        {/* Card Name */}
        <div>
          <p className="text-xs opacity-70 mb-1 font-medium tracking-wide">CARD NAME</p>
          <p className="text-lg font-bold tracking-wide">{cardName}</p>
        </div>

        {/* Balance */}
        <div className="space-y-1">
          <p className="text-xs opacity-70 font-medium tracking-wide">AVAILABLE BALANCE</p>
          <p className="text-3xl font-bold tracking-tight">
            {showBalance ? `$${balance.toLocaleString()}` : "••••••"}
          </p>
        </div>

        {/* Card Number Preview */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-black/60"></div>
                <div className="w-2 h-2 rounded-full bg-black/60"></div>
                <div className="w-2 h-2 rounded-full bg-black/60"></div>
                <div className="w-2 h-2 rounded-full bg-black/60"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
