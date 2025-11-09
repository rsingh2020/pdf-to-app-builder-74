import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Save, X, Trash2, Shield, CheckCircle2, Lock, Upload, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge } from "@/components/VerificationBadge";
import { SSNVerificationModal } from "@/components/SSNVerificationModal";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [uploadingID, setUploadingID] = useState(false);
  const [ssnModalOpen, setSsnModalOpen] = useState(false);
  const [verifyingSSN, setVerifyingSSN] = useState(false);
  const [showDOB, setShowDOB] = useState(false);
  const idFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    date_of_birth: "",
    phone_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip_code: "",
    email: "",
  });

  const [verification, setVerification] = useState({
    profile_completed: false,
    ssn_verified: false,
    id_verified: false,
    verification_level: "unverified" as "unverified" | "basic" | "verified" | "premium",
  });

  const [cards, setCards] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          date_of_birth: profileData.date_of_birth || "",
          phone_number: profileData.phone_number || "",
          address_line1: profileData.address_line1 || "",
          address_line2: profileData.address_line2 || "",
          city: profileData.city || "",
          state: profileData.state || "",
          zip_code: profileData.zip_code || "",
          email: profileData.email || "",
        });
      }

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from("verification_status")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (verificationData) {
        setVerification({
          profile_completed: verificationData.profile_completed,
          ssn_verified: verificationData.ssn_verified,
          id_verified: verificationData.id_verified,
          verification_level: verificationData.verification_level as any,
        });
      }

      // Fetch cards
      const { data: cardsData } = await supabase
        .from("cards")
        .select("*")
        .eq("user_id", session.user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (cardsData) {
        setCards(cardsData);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          date_of_birth: profile.date_of_birth,
          phone_number: profile.phone_number,
          address_line1: profile.address_line1,
          address_line2: profile.address_line2 || null,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      });

      setEditMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deleteCardId) return;

    try {
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", deleteCardId);

      if (error) throw error;

      setCards(cards.filter(c => c.id !== deleteCardId));
      
      toast({
        title: "Card removed",
        description: "The card has been removed from your account.",
      });

      setDeleteCardId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete card",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimary = async (cardId: string) => {
    if (!user) return;

    try {
      // Set all cards to non-primary
      await supabase
        .from("cards")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      // Set selected card as primary
      const { error } = await supabase
        .from("cards")
        .update({ is_primary: true })
        .eq("id", cardId);

      if (error) throw error;

      // Update local state
      setCards(cards.map(c => ({ ...c, is_primary: c.id === cardId })));

      toast({
        title: "Primary card updated",
        description: "This card is now your primary payment method.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set primary card",
        variant: "destructive",
      });
    }
  };

  const validateFileSignature = async (file: File): Promise<boolean> => {
    // Read the first 8 bytes to check magic bytes
    const arrayBuffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Magic bytes for different file types
    const signatures: { [key: string]: number[][] } = {
      'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
      'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
      'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // PDF
    };

    const expectedSignatures = signatures[file.type];
    if (!expectedSignatures) return false;

    return expectedSignatures.some(signature => 
      signature.every((byte, index) => bytes[index] === byte)
    );
  };

  const handleIDUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type against whitelist
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate minimum file size (10KB) to prevent empty/corrupt files
    if (file.size < 10 * 1024) {
      toast({
        title: "File too small",
        description: "The file appears to be empty or corrupted.",
        variant: "destructive",
      });
      return;
    }

    // Validate filename - prevent path traversal
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExt = sanitizedName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      toast({
        title: "Invalid file extension",
        description: "File extension must be jpg, jpeg, png, or pdf.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingID(true);

      // Verify magic bytes match file type (prevents file type spoofing)
      const isValidSignature = await validateFileSignature(file);
      if (!isValidSignature) {
        toast({
          title: "File validation failed",
          description: "The file content doesn't match its type. Please upload a valid ID document.",
          variant: "destructive",
        });
        return;
      }

      // Upload to storage with sanitized filename
      const fileName = `${user.id}/id-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('id-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Note: ID verification is pending admin review
      // Do NOT automatically set id_verified to true
      toast({
        title: "ID uploaded successfully",
        description: "Your ID has been uploaded and is pending verification. This may take 1-2 business days.",
      });

      // Reset file input
      if (idFileInputRef.current) {
        idFileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload ID document",
        variant: "destructive",
      });
    } finally {
      setUploadingID(false);
    }
  };

  const handleSSNVerification = async (ssn: string) => {
    if (!user) return;

    try {
      setVerifyingSSN(true);

      // Mock verification - in production, this would call a KYC service
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update verification status
      const { error } = await supabase
        .from('verification_status')
        .update({ 
          ssn_verified: true,
          verification_level: verification.id_verified ? 'verified' : 'basic'
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setVerification({
        ...verification,
        ssn_verified: true,
        verification_level: verification.id_verified ? 'verified' : 'basic'
      });

      toast({
        title: "SSN verified successfully",
        description: "You now have access to full transaction capabilities.",
      });

      setSsnModalOpen(false);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify SSN",
        variant: "destructive",
      });
    } finally {
      setVerifyingSSN(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <VerificationBadge level={verification.verification_level} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent via-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-background">
              {profile.full_name?.charAt(0) || "U"}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            {profile.full_name || "User Profile"}
          </h1>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>

        {/* Verification Status */}
        <Card className="shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Verification Status</h2>
              <VerificationBadge level={verification.verification_level} showTooltip={false} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {verification.profile_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Profile Information</p>
                    <p className="text-sm text-muted-foreground">Basic account details</p>
                  </div>
                </div>
                {verification.profile_completed ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {verification.ssn_verified ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">SSN Verification</p>
                    <p className="text-sm text-muted-foreground">Required for transactions</p>
                  </div>
                </div>
                {verification.ssn_verified ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Verified
                  </Badge>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSsnModalOpen(true)}
                  >
                    Verify Now
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {verification.id_verified ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">ID Verification</p>
                    <p className="text-sm text-muted-foreground">Review within 1-2 business days</p>
                  </div>
                </div>
                {verification.id_verified ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Verified
                  </Badge>
                ) : (
                  <>
                    <input
                      ref={idFileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleIDUpload}
                      className="hidden"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => idFileInputRef.current?.click()}
                      disabled={uploadingID}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingID ? "Uploading..." : "Upload ID"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {verification.verification_level !== "premium" && (
              <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                <h3 className="font-semibold text-foreground mb-2">
                  ⭐ Upgrade to {verification.verification_level === "verified" ? "Premium" : "Verified"}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {verification.verification_level === "verified" 
                    ? "Get priority support, exclusive features, and higher transaction limits."
                    : "Complete SSN verification to unlock unlimited transactions and full features."}
                </p>
                <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                  Upgrade Now
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
              {!editMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditMode(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {editMode ? (
                    <Input
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.full_name || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  {editMode ? (
                    <Input
                      type="date"
                      value={profile.date_of_birth}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-foreground font-medium">
                        {showDOB ? (profile.date_of_birth || "—") : "••••-••-••"}
                      </p>
                      {profile.date_of_birth && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowDOB(!showDOB)}
                        >
                          {showDOB ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-foreground font-medium">{profile.email}</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  {editMode ? (
                    <Input
                      value={profile.phone_number}
                      onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.phone_number || "—"}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Street Address</Label>
                {editMode ? (
                  <Input
                    value={profile.address_line1}
                    onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })}
                  />
                ) : (
                  <p className="text-foreground font-medium">{profile.address_line1 || "—"}</p>
                )}
              </div>

              {(editMode || profile.address_line2) && (
                <div className="space-y-2">
                  <Label>Apt, Suite (Optional)</Label>
                  {editMode ? (
                    <Input
                      value={profile.address_line2}
                      onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.address_line2}</p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  {editMode ? (
                    <Input
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.city || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  {editMode ? (
                    <Input
                      value={profile.state}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      maxLength={2}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.state || "—"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>ZIP Code</Label>
                  {editMode ? (
                    <Input
                      value={profile.zip_code}
                      onChange={(e) => setProfile({ ...profile, zip_code: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profile.zip_code || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Connected Cards */}
        <Card className="shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Connected Cards</h2>
              <Badge variant="outline">{cards.length} {cards.length === 1 ? "Card" : "Cards"}</Badge>
            </div>

            {cards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No cards connected yet</p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                >
                  Add Your First Card
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-card-vibrant rounded-lg flex items-center justify-center text-white font-mono">
                        ••••
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{card.card_name}</p>
                          {card.is_primary && (
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {card.card_type} •••• {card.last_four}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!card.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(card.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteCardId(card.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Delete Card Dialog */}
      <AlertDialog open={!!deleteCardId} onOpenChange={() => setDeleteCardId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Card?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this card from your account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SSN Verification Modal */}
      <SSNVerificationModal
        open={ssnModalOpen}
        onClose={() => setSsnModalOpen(false)}
        onVerify={handleSSNVerification}
        isVerifying={verifyingSSN}
      />
    </div>
  );
};

export default Profile;
