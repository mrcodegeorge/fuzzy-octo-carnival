import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { useDynamicFavicon } from "@/hooks/useDynamicFavicon";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import ProductPage from "./pages/ProductPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import AccountPage from "./pages/AccountPage";
import FAQPage from "./pages/FAQPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCustomerInsights from "./pages/admin/AdminCustomerInsights";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminDeliveryZones from "./pages/admin/AdminDeliveryZones";
import AdminBlogPosts from "./pages/admin/AdminBlogPosts";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const StorefrontLayout = ({ children }: { children: React.ReactNode }) => {
  useDynamicFavicon();
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
};

const AppContent = () => (
  <BrowserRouter>
    <Routes>
      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomerInsights />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="delivery-zones" element={<AdminDeliveryZones />} />
        <Route path="blog" element={<AdminBlogPosts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Storefront routes */}
      <Route path="/" element={<StorefrontLayout><Index /></StorefrontLayout>} />
      <Route path="/shop" element={<StorefrontLayout><ShopPage /></StorefrontLayout>} />
      <Route path="/product/:id" element={<StorefrontLayout><ProductPage /></StorefrontLayout>} />
      <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
      <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />
      <Route path="/blog" element={<StorefrontLayout><BlogPage /></StorefrontLayout>} />
      <Route path="/blog/:slug" element={<StorefrontLayout><BlogPostPage /></StorefrontLayout>} />
      <Route path="/auth" element={<StorefrontLayout><AuthPage /></StorefrontLayout>} />
      <Route path="/reset-password" element={<StorefrontLayout><ResetPasswordPage /></StorefrontLayout>} />
      <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />
      <Route path="/order-confirmation" element={<StorefrontLayout><OrderConfirmationPage /></StorefrontLayout>} />
      <Route path="/account" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
      <Route path="/notifications" element={<StorefrontLayout><NotificationsPage /></StorefrontLayout>} />
      <Route path="/faq" element={<StorefrontLayout><FAQPage /></StorefrontLayout>} />
      <Route path="/shipping" element={<StorefrontLayout><ShippingPolicyPage /></StorefrontLayout>} />
      <Route path="/privacy" element={<StorefrontLayout><PrivacyPolicyPage /></StorefrontLayout>} />
      <Route path="/terms" element={<StorefrontLayout><TermsPage /></StorefrontLayout>} />
      <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
    </Routes>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Sonner />
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
