import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Save, Store, Truck, Bell, Palette, Globe, CreditCard, Loader2, Upload, X, ImageIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStoreSettings, useUpdateSetting } from "@/hooks/useStoreSettings";

const SettingsCard = ({ icon: Icon, title, delay, children }: { icon: any; title: string; delay: number; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="border border-border bg-card p-6"
  >
    <div className="mb-5 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center bg-primary/10">
        <Icon size={16} className="text-primary" />
      </div>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const InputField = ({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    <input
      {...props}
      className="mt-1 w-full border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
    />
    {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const ToggleField = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-border"}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

const BrandingUpload = ({ label, hint, value, onChange, uploading, setUploading, inputRef, small }: {
  label: string; hint: string; value: string; onChange: (v: string) => void;
  uploading: boolean; setUploading: (v: boolean) => void; inputRef: React.RefObject<HTMLInputElement>; small?: boolean;
}) => {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `branding/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      onChange(data.publicUrl);
      toast.success(`${label} uploaded!`);
    } catch (err: any) { toast.error(err.message || "Upload failed"); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };
  const size = small ? "h-12 w-12" : "h-16 w-16";
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className={`${size} shrink-0 overflow-hidden border border-border bg-muted/30 flex items-center justify-center`}>
          {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : <ImageIcon size={small ? 16 : 22} className="text-muted-foreground" />}
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {value && <button type="button" onClick={() => onChange("")} className="flex items-center gap-1 px-2 py-1.5 text-xs text-destructive hover:underline"><X size={12} /> Remove</button>}
          </div>
          <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
      </div>
    </div>
  );
};

const AdminSettings = () => {
  const { data: settings, isLoading } = useStoreSettings();
  const updateSetting = useUpdateSetting();

  const [storeName, setStoreName] = useState("Tillies Avenue");
  const [storeTagline, setStoreTagline] = useState("Beauty & Skincare for Every Skin");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [shippingFee, setShippingFee] = useState("35");
  const [processingDays, setProcessingDays] = useState("1-2");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappOnOrder, setWhatsappOnOrder] = useState(true);
  const [whatsappOnShip, setWhatsappOnShip] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialTiktok, setSocialTiktok] = useState("");
  const [emailApiType, setEmailApiType] = useState("resend");
  const [emailApiKey, setEmailApiKey] = useState("");
  const [emailApiEndpoint, setEmailApiEndpoint] = useState("");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [siteFavicon, setSiteFavicon] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Load settings from DB
  useEffect(() => {
    if (settings) {
      if (settings.store_name) setStoreName(settings.store_name);
      if (settings.store_tagline) setStoreTagline(settings.store_tagline);
      if (settings.store_email) setStoreEmail(settings.store_email);
      if (settings.store_phone) setStorePhone(settings.store_phone);
      if (settings.store_address) setStoreAddress(settings.store_address);
      if (settings.shipping_fee) setShippingFee(settings.shipping_fee);
      if (settings.processing_days) setProcessingDays(settings.processing_days);
      if (settings.whatsapp_number) setWhatsappNumber(settings.whatsapp_number);
      if (settings.whatsapp_on_order) setWhatsappOnOrder(settings.whatsapp_on_order === "true");
      if (settings.whatsapp_on_ship) setWhatsappOnShip(settings.whatsapp_on_ship === "true");
      if (settings.email_notifications) setEmailNotifications(settings.email_notifications === "true");
      if (settings.social_instagram) setSocialInstagram(settings.social_instagram);
      if (settings.social_facebook) setSocialFacebook(settings.social_facebook);
      if (settings.social_tiktok) setSocialTiktok(settings.social_tiktok);
      if (settings.paystack_public_key) setPaystackPublicKey(settings.paystack_public_key);
      if (settings.paystack_secret_key) setPaystackSecretKey(settings.paystack_secret_key);
      if (settings.paystack_enabled) setPaystackEnabled(settings.paystack_enabled === "true");
      if (settings.site_logo) setSiteLogo(settings.site_logo);
      if (settings.site_favicon) setSiteFavicon(settings.site_favicon);
      if (settings.email_api_type) setEmailApiType(settings.email_api_type);
      if (settings.email_api_key) setEmailApiKey(settings.email_api_key);
      if (settings.email_api_endpoint) setEmailApiEndpoint(settings.email_api_endpoint);
      if (settings.smtp_from_email) setSmtpFromEmail(settings.smtp_from_email);
      if (settings.smtp_from_name) setSmtpFromName(settings.smtp_from_name);
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const allSettings: Record<string, string> = {
        store_name: storeName,
        store_tagline: storeTagline,
        store_email: storeEmail,
        store_phone: storePhone,
        store_address: storeAddress,
        shipping_fee: shippingFee,
        processing_days: processingDays,
        whatsapp_number: whatsappNumber,
        whatsapp_on_order: String(whatsappOnOrder),
        whatsapp_on_ship: String(whatsappOnShip),
        email_notifications: String(emailNotifications),
        paystack_public_key: paystackPublicKey,
        paystack_secret_key: paystackSecretKey,
        paystack_enabled: String(paystackEnabled),
        social_instagram: socialInstagram,
        social_facebook: socialFacebook,
        social_tiktok: socialTiktok,
        site_logo: siteLogo,
        site_favicon: siteFavicon,
        email_api_type: emailApiType,
        email_api_key: emailApiKey,
        email_api_endpoint: emailApiEndpoint,
        smtp_from_email: smtpFromEmail,
        smtp_from_name: smtpFromName,
      };

      for (const [key, value] of Object.entries(allSettings)) {
        await updateSetting.mutateAsync({ key, value });
      }
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Store Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure your store preferences — changes are saved to the database</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition-colors hover:bg-primary disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save All
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SettingsCard icon={Store} title="Store Information" delay={0}>
          <div className="space-y-4">
            <InputField label="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
            <InputField label="Tagline" value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)} />
            <InputField label="Contact Email" type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} placeholder="hello@tilliesavenue.com" />
            <InputField label="Phone Number" type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="+233 XX XXX XXXX" />
            <InputField label="Store Address" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} placeholder="Accra, Ghana" />
          </div>
        </SettingsCard>

        <SettingsCard icon={Truck} title="Shipping & Delivery" delay={0.05}>
          <div className="space-y-4">
            <InputField label="Flat Shipping Fee (GH₵)" type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} hint="Applied to all orders regardless of total" />
            <InputField label="Processing Time" value={processingDays} onChange={(e) => setProcessingDays(e.target.value)} hint="e.g. '1-2 business days'" />
            <div className="border-t border-border pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Delivery Zones</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>Greater Accra</span>
                  <span className="font-medium">GH₵ {shippingFee}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Other Regions</span>
                  <span className="italic">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={Bell} title="Notifications" delay={0.1}>
          <div className="space-y-4">
            <InputField label="WhatsApp Business Number" type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="233XXXXXXXXX" hint="Used for sending order updates (no + prefix)" />
            <div className="space-y-1 border-t border-border pt-3">
              <ToggleField label="Order Confirmation" description="Send WhatsApp when order is placed" checked={whatsappOnOrder} onChange={() => setWhatsappOnOrder(!whatsappOnOrder)} />
              <ToggleField label="Shipping Update" description="Notify when order is shipped" checked={whatsappOnShip} onChange={() => setWhatsappOnShip(!whatsappOnShip)} />
              <ToggleField label="Email Notifications" description="Send email receipts to customers" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={Mail} title="Email Notifications" delay={0.13}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Email Provider</label>
              <select
                value={emailApiType}
                onChange={(e) => setEmailApiType(e.target.value)}
                className="mt-1 w-full border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="resend">Resend</option>
                <option value="custom_api">Custom API</option>
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {emailApiType === "resend" ? "Use Resend.com for transactional emails" : "Use your own email API endpoint"}
              </p>
            </div>
            <InputField label="API Key" type="password" value={emailApiKey} onChange={(e) => setEmailApiKey(e.target.value)} placeholder="re_xxxx or your API key" hint="Your email provider API key" />
            {emailApiType === "custom_api" && (
              <InputField label="API Endpoint" value={emailApiEndpoint} onChange={(e) => setEmailApiEndpoint(e.target.value)} placeholder="https://api.example.com/send" hint="POST endpoint that accepts {from, to, subject, html}" />
            )}
            <InputField label="From Email" type="email" value={smtpFromEmail} onChange={(e) => setSmtpFromEmail(e.target.value)} placeholder="noreply@yourdomain.com" hint="Sender email address (must be verified with your provider)" />
            <InputField label="From Name" value={smtpFromName} onChange={(e) => setSmtpFromName(e.target.value)} placeholder="Tillies Avenue" hint="Name that appears in the 'From' field" />
          </div>
        </SettingsCard>

        <SettingsCard icon={CreditCard} title="Payment — Paystack" delay={0.15}>
          <div className="space-y-1">
            <ToggleField label="Paystack (Cards & MoMo)" description="Accept card and mobile money via Paystack" checked={paystackEnabled} onChange={() => setPaystackEnabled(!paystackEnabled)} />
            {paystackEnabled && (
              <div className="mt-3 space-y-3">
                <InputField label="Paystack Public Key" value={paystackPublicKey} onChange={(e) => setPaystackPublicKey(e.target.value)} placeholder="pk_live_xxxx or pk_test_xxxx" hint="Found in your Paystack dashboard → Settings → API Keys" />
                <InputField label="Paystack Secret Key" type="password" value={paystackSecretKey} onChange={(e) => setPaystackSecretKey(e.target.value)} placeholder="sk_live_xxxx or sk_test_xxxx" hint="Keep this private — used for server-side verification" />
              </div>
            )}
          </div>
        </SettingsCard>

        <SettingsCard icon={Globe} title="Social Media & SEO" delay={0.2}>
          <div className="space-y-4">
            <InputField label="Instagram" value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} placeholder="@tilliesavenue" />
            <InputField label="Facebook" value={socialFacebook} onChange={(e) => setSocialFacebook(e.target.value)} placeholder="facebook.com/tilliesavenue" />
            <InputField label="TikTok" value={socialTiktok} onChange={(e) => setSocialTiktok(e.target.value)} placeholder="@tilliesavenue" />
          </div>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Branding & Theme" delay={0.25}>
          <div className="space-y-5">
            {/* Logo Upload */}
            <BrandingUpload
              label="Site Logo"
              hint="Displayed in the header and footer. Recommended: 200×60px PNG with transparency."
              value={siteLogo}
              onChange={setSiteLogo}
              uploading={uploadingLogo}
              setUploading={setUploadingLogo}
              inputRef={logoInputRef}
            />

            {/* Favicon Upload */}
            <BrandingUpload
              label="Favicon"
              hint="Browser tab icon. Recommended: 64×64px PNG or ICO."
              value={siteFavicon}
              onChange={setSiteFavicon}
              uploading={uploadingFavicon}
              setUploading={setUploadingFavicon}
              inputRef={faviconInputRef}
              small
            />

            <div className="border-t border-border pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current Theme</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-8 w-8 bg-primary" title="Terracotta" />
                  <div className="h-8 w-8 bg-accent" title="Gold" />
                  <div className="h-8 w-8 bg-foreground" title="Charcoal" />
                  <div className="h-8 w-8 border border-border bg-background" title="Cream" />
                </div>
                <span className="text-sm text-muted-foreground">Terracotta & Cream</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Typography</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-heading">Playfair Display</span>
                  <span className="text-xs text-muted-foreground">Headings</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-body">DM Sans</span>
                  <span className="text-xs text-muted-foreground">Body</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-accent">Space Grotesk</span>
                  <span className="text-xs text-muted-foreground">Accent</span>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
};

export default AdminSettings;
