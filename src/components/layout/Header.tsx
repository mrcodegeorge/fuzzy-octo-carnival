import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Search, Heart, Menu, X, User, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion, AnimatePresence } from "framer-motion";
import SearchDialog from "@/components/SearchDialog";

const Header = () => {
  const { user } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const { data: storeSettings } = useStoreSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const logoUrl = storeSettings?.site_logo;

  const navLinks = [
    { label: "New Arrivals", to: "/shop" },
    { label: "Shop", to: "/shop" },
    { label: "Skincare", to: "/shop?category=skincare" },
    { label: "Makeup", to: "/shop?category=makeup" },
    { label: "Blog", to: "/blog" },
    { label: "About", to: "/about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/98 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="flex items-center gap-1.5">
            {logoUrl ? (
              <img src={logoUrl} alt="Store Logo" className="h-8 max-w-[160px] object-contain" />
            ) : (
              <>
                <span className="flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground font-accent text-xs font-bold">
                  {(storeSettings?.store_name || "Tillies Avenue").charAt(0)}
                </span>
                <span className="font-heading text-lg font-bold tracking-wide md:text-xl">
                  {storeSettings?.store_name || <>Tillies <span className="italic text-primary">Avenue</span></>}
                </span>
              </>
            )}
          </Link>

          <nav className="hidden gap-7 md:flex">
            {navLinks.map((link) => (
              <Link key={link.to + link.label} to={link.to} className="font-accent text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <Link to="/admin" className="hidden p-2 text-primary transition-colors hover:text-primary/80 md:block" title="Admin Dashboard">
                <Shield size={18} />
              </Link>
            )}
            <Link to={user ? "/account" : "/auth"} className="hidden p-2 text-foreground/60 transition-colors hover:text-foreground md:block">
              <User size={18} />
            </Link>
            <button onClick={() => setSearchOpen(true)} className="hidden p-2 text-foreground/60 transition-colors hover:text-foreground md:block" aria-label="Search">
              <Search size={18} />
            </button>
            <button className="hidden p-2 text-foreground/60 transition-colors hover:text-foreground md:block">
              <Heart size={18} />
            </button>
            <button className="relative p-2 text-foreground/60 transition-colors hover:text-foreground" onClick={() => setIsCartOpen(true)} aria-label="Open cart">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-primary text-[9px] font-bold text-primary-foreground">{totalItems}</span>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border md:hidden">
              <div className="container flex flex-col gap-0 py-2">
                {navLinks.map((link) => (
                  <Link key={link.to + link.label} to={link.to} className="border-b border-border/50 px-2 py-3.5 font-accent text-sm font-medium text-foreground/70 transition-colors hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <button onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }} className="border-b border-border/50 px-2 py-3.5 font-accent text-sm font-medium text-foreground/70 text-left flex items-center gap-2">
                  <Search size={14} /> Search Products
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Header;
