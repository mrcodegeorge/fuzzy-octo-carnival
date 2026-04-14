import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.19a8.16 8.16 0 004.76 1.53v-3.4a4.85 4.85 0 01-1-.63z" />
  </svg>
);

const Footer = () => {
  const { data: storeSettings } = useStoreSettings();
  const logoUrl = storeSettings?.site_logo;
  const storeName = storeSettings?.store_name || "Tillies Avenue";
  const storeEmail = storeSettings?.store_email;
  const storePhone = storeSettings?.store_phone;
  const storeAddress = storeSettings?.store_address;
  const instagram = storeSettings?.social_instagram;
  const facebook = storeSettings?.social_facebook;
  const tiktok = storeSettings?.social_tiktok;

  const getInstagramUrl = (handle: string) => {
    if (!handle) return "#";
    const clean = handle.replace(/^@/, "");
    if (clean.includes("instagram.com")) return clean.startsWith("http") ? clean : `https://${clean}`;
    return `https://instagram.com/${clean}`;
  };

  const getFacebookUrl = (handle: string) => {
    if (!handle) return "#";
    if (handle.includes("facebook.com")) return handle.startsWith("http") ? handle : `https://${handle}`;
    return `https://facebook.com/${handle}`;
  };

  const getTikTokUrl = (handle: string) => {
    if (!handle) return "#";
    const clean = handle.replace(/^@/, "");
    if (clean.includes("tiktok.com")) return clean.startsWith("http") ? clean : `https://${clean}`;
    return `https://tiktok.com/@${clean}`;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    if (phone.startsWith("+")) return phone;
    if (phone.startsWith("233")) return `+${phone}`;
    return phone;
  };

  const socialLinks = [
    ...(instagram ? [{ icon: Instagram, href: getInstagramUrl(instagram) }] : []),
    ...(facebook ? [{ icon: Facebook, href: getFacebookUrl(facebook) }] : []),
    ...(tiktok ? [{ icon: TikTokIcon, href: getTikTokUrl(tiktok) }] : []),
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container section-padding">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-1.5">
              {logoUrl ? (
                <img src={logoUrl} alt="Store Logo" className="h-7 max-w-[140px] object-contain" />
              ) : (
                <>
                  <span className="flex h-6 w-6 items-center justify-center bg-foreground text-background font-accent text-[10px] font-bold">
                    {storeName.charAt(0)}
                  </span>
                  <span className="font-heading text-lg font-bold">{storeName}</span>
                </>
              )}
            </div>
            <p className="mt-4 font-accent text-sm leading-relaxed text-muted-foreground">
              Your trusted source for authentic skincare, makeup, and beauty products.
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socialLinks.map(({ icon: Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background">
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold tracking-[0.2em] uppercase">Quick Links</h4>
            <div className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "Shop All", to: "/shop" },
                { label: "Skincare", to: "/shop?category=skincare" },
                { label: "Makeup", to: "/shop?category=makeup" },
                { label: "Blog", to: "/blog" },
                { label: "About Us", to: "/about" },
              ].map((link) => (
                <Link key={link.label} to={link.to} className="group flex items-center gap-1 font-accent text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                  <ArrowUpRight size={10} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold tracking-[0.2em] uppercase">Help</h4>
            <div className="mt-4 flex flex-col gap-2.5">
              {[
                { label: "FAQ", to: "/faq" },
                { label: "Shipping & Returns", to: "/shipping" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Contact Us", to: "/contact" },
              ].map((link) => (
                <Link key={link.label} to={link.to} className="font-accent text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-accent text-xs font-semibold tracking-[0.2em] uppercase">Contact Us</h4>
            <div className="mt-4 flex flex-col gap-3">
              {storeEmail && (
                <a href={`mailto:${storeEmail}`} className="flex items-center gap-2 font-accent text-sm text-muted-foreground hover:text-foreground">
                  <Mail size={14} /> {storeEmail}
                </a>
              )}
              {storePhone && (
                <a href={`tel:${formatPhone(storePhone)}`} className="flex items-center gap-2 font-accent text-sm text-muted-foreground hover:text-foreground">
                  <Phone size={14} /> {formatPhone(storePhone)}
                </a>
              )}
              {storeAddress && (
                <span className="flex items-center gap-2 font-accent text-sm text-muted-foreground">
                  <MapPin size={14} /> {storeAddress}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="font-accent text-xs text-muted-foreground">© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
