import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ssnSchema = z.object({
  ssn: z
    .string()
    .trim()
    .refine((val) => {
      // Remove dashes and check if it's 9 digits
      const cleaned = val.replace(/-/g, "");
      return /^\d{9}$/.test(cleaned);
    }, "SSN must be 9 digits (format: XXX-XX-XXXX)")
    .transform((val) => val.replace(/-/g, "")),
});

type SSNFormData = z.infer<typeof ssnSchema>;

interface SSNVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (ssn: string) => Promise<void>;
  isVerifying: boolean;
}

export const SSNVerificationModal = ({
  open,
  onClose,
  onVerify,
  isVerifying,
}: SSNVerificationModalProps) => {
  const [showWarning, setShowWarning] = useState(true);

  const form = useForm<SSNFormData>({
    resolver: zodResolver(ssnSchema),
    defaultValues: {
      ssn: "",
    },
  });

  const handleSubmit = async (data: SSNFormData) => {
    await onVerify(data.ssn);
    form.reset();
  };

  const formatSSN = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");
    
    // Add dashes at appropriate positions
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    form.setValue("ssn", formatted);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Verify Your SSN</DialogTitle>
          </div>
          <DialogDescription>
            Enter your Social Security Number to unlock full transaction capabilities.
          </DialogDescription>
        </DialogHeader>

        {showWarning && (
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Development Mode:</strong> This is a mock verification for testing. 
              In production, SSN would be verified through a secure KYC service.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ssn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Social Security Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="XXX-XX-XXXX"
                      maxLength={11}
                      onChange={handleInputChange}
                      disabled={isVerifying}
                      className="font-mono tracking-wider"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-1">🔒 Your data is secure</p>
              <p className="text-xs">
                SSN is encrypted and never stored in plain text. We use bank-level security.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isVerifying}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isVerifying}
                className="flex-1 bg-foreground text-background hover:bg-foreground/90"
              >
                {isVerifying ? "Verifying..." : "Verify SSN"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
