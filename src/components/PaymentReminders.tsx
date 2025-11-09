import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Bell, Calendar, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface CardWithReminder {
  id: string;
  card_name: string;
  due_date: string | null;
  pending_dues: number;
  last_four: string;
}

export const PaymentReminders = ({ cards }: { cards: any[] }) => {
  const [upcomingPayments, setUpcomingPayments] = useState<CardWithReminder[]>([]);

  useEffect(() => {
    if (!cards || cards.length === 0) return;

    // Filter cards with upcoming due dates
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcoming = cards
      .filter((card) => {
        if (!card.due_date) return false;
        const dueDate = new Date(card.due_date);
        return dueDate >= now && dueDate <= sevenDaysFromNow;
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateA.getTime() - dateB.getTime();
      });

    setUpcomingPayments(upcoming);
  }, [cards]);

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 2) return "destructive";
    if (days <= 5) return "warning";
    return "secondary";
  };

  if (upcomingPayments.length === 0) {
    return (
      <Card className="shadow-card bg-gradient-to-br from-green-500/5 to-green-500/10">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-bold text-foreground">Payment Reminders</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            ✅ No payments due in the next 7 days
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card bg-gradient-to-br from-amber-500/5 to-red-500/5">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-bold text-foreground">Payment Reminders</h3>
          </div>
          <Badge variant="destructive">{upcomingPayments.length}</Badge>
        </div>

        <div className="space-y-3">
          {upcomingPayments.map((card) => {
            const daysUntilDue = getDaysUntilDue(card.due_date!);
            const urgency = getUrgencyColor(daysUntilDue);

            return (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      daysUntilDue <= 2
                        ? "bg-red-500"
                        : daysUntilDue <= 5
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {card.card_name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ••••  {card.last_four}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {new Date(card.due_date!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-foreground">
                    ${Number(card.pending_dues).toFixed(2)}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      daysUntilDue <= 2
                        ? "text-red-600"
                        : daysUntilDue <= 5
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }`}
                  >
                    {daysUntilDue === 0
                      ? "Due today!"
                      : daysUntilDue === 1
                      ? "Due tomorrow"
                      : `${daysUntilDue} days left`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {upcomingPayments.some((card) => getDaysUntilDue(card.due_date!) <= 2) && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <p className="text-xs text-red-600">
              You have urgent payments due within 2 days. Pay now to avoid late
              fees!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};