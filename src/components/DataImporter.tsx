import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

const parseCSV = (text: string): any[] => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    return obj;
  });
};

interface DataImporterProps {
  onDataImported?: () => void;
}

export const DataImporter = ({ onDataImported }: DataImporterProps = {}) => {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const importData = async () => {
    try {
      setImporting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to import data",
          variant: "destructive"
        });
        return;
      }

      // Fetch and parse CSV files
      const [cardsResponse, transactionsResponse] = await Promise.all([
        fetch('/data/cards_20.csv'),
        fetch('/data/transactions_500.csv')
      ]);

      const cardsText = await cardsResponse.text();
      const transactionsText = await transactionsResponse.text();

      const cardsData = parseCSV(cardsText);
      const transactionsData = parseCSV(transactionsText);

      // Step 1: Insert cards and build mapping
      const cardMapping: Record<string, string> = {};
      
      for (const card of cardsData) {
        const { data, error } = await supabase
          .from('cards')
          .insert({
            user_id: user.id,
            card_name: card.nickname || card.product_name,
            last_four: card.mask,
            card_type: card.network,
            credit_limit: parseFloat(card.credit_limit),
            balance: parseFloat(card.current_balance),
            apr: parseFloat(card.apr),
            annual_fee: parseFloat(card.annual_fee),
            rewards_type: card.rewards_summary?.includes('cashback') ? 'cashback' : 
                         card.rewards_summary?.includes('miles') ? 'miles' : 'points',
            due_date: card.next_payment_due_date,
            pending_dues: parseFloat(card.statement_balance),
          })
          .select('id')
          .single();

        if (error) {
          console.error('Card insert error:', error);
          continue;
        }
        if (data) {
          cardMapping[card.account_id] = data.id;
        }
      }

      toast({
        title: "Cards Imported!",
        description: `Imported ${Object.keys(cardMapping).length} cards successfully!`,
      });

      // Step 2: Insert transactions in batches
      const batchSize = 50;
      let imported = 0;
      
      for (let i = 0; i < transactionsData.length; i += batchSize) {
        const batch = transactionsData.slice(i, i + batchSize);
        const transactionsToInsert = batch
          .filter(txn => cardMapping[txn.account_id])
          .map(txn => ({
            user_id: user.id,
            card_id: cardMapping[txn.account_id],
            merchant_name: txn.merchant_name,
            amount: parseFloat(txn.amount),
            category: txn.category,
            transaction_date: txn.date,
            rewards_earned: 0
          }));

        if (transactionsToInsert.length > 0) {
          const { error } = await supabase
            .from('transactions')
            .insert(transactionsToInsert);

          if (!error) {
            imported += transactionsToInsert.length;
          }
        }
      }

      toast({
        title: "Import Complete!",
        description: `Imported ${Object.keys(cardMapping).length} cards and ${imported} transactions.`,
      });

      // Call the callback to refresh cards
      if (onDataImported) {
        onDataImported();
      }
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import data",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Import Demo Data
          </h3>
          <p className="text-sm text-muted-foreground">
            Import 20 credit cards and 500 transactions to populate your dashboard. This will help you explore all features with realistic data.
          </p>
        </div>
        
        <Button
          onClick={importData}
          disabled={importing}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {importing ? "Importing..." : "Import Sample Data"}
        </Button>
      </div>
    </Card>
  );
};