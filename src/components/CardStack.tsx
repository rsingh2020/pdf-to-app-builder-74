import { useState } from "react";
import { CreditCard } from "./CreditCard";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface CardData {
  id: string;
  card_name: string;
  card_type: string;
  balance: number;
  gradient?: string;
}

interface CardStackProps {
  cards: CardData[];
  onAddCard?: () => void;
}

export const CardStack = ({ cards, onAddCard }: CardStackProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCardClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const maxVisibleCards = 3;
  const cardSpacing = 220; // Space between cards (no overlap)

  return (
    <div className="relative w-full space-y-6">
      {/* Active Card */}
      <div className="relative">
        <CreditCard
          cardName={cards[activeIndex].card_name}
          cardType={cards[activeIndex].card_type}
          balance={parseFloat(cards[activeIndex].balance.toString())}
          gradient={cards[activeIndex].gradient as any}
          isStacked={false}
          isActive={true}
        />
      </div>

      {/* Stacked Card Indicators - Just visual tabs */}
      {cards.length > 1 && (
        <div className="flex gap-2 justify-center -mt-2">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'w-8 bg-primary' 
                    : 'w-1.5 bg-border hover:bg-primary/50'
                }`}
                aria-label={`Switch to ${card.card_name}`}
              />
            );
          })}
        </div>
      )}

      {/* Add Card Button */}
      {onAddCard && (
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full h-16 border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-accent/5 transition-all"
            onClick={onAddCard}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Card
          </Button>
        </div>
      )}
    </div>
  );
};
