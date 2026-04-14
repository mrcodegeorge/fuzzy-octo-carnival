import ceramideToner from "@/assets/products/ceramide-toner.jpg";
import niacinamideCream from "@/assets/products/niacinamide-cream.jpg";
import liquidEyeliner from "@/assets/products/liquid-eyeliner.jpg";
import eyeshadowPalette from "@/assets/products/eyeshadow-palette.jpg";
import mascara from "@/assets/products/mascara.jpg";
import beanEssence from "@/assets/products/bean-essence.jpg";
import salicylicCleanser from "@/assets/products/salicylic-cleanser.jpg";
import settingSpray from "@/assets/products/setting-spray.jpg";
import mensBodyWash from "@/assets/products/mens-body-wash.jpg";
import mensLotion from "@/assets/products/mens-lotion.jpg";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  subcategory?: string;
  rating: number;
  reviews: number;
  description: string;
  ingredients?: string;
  howToUse?: string;
  skinType?: string[];
  badges?: string[];
  inStock: boolean;
}

export const categories = [
  { name: "Skincare", icon: "✨", slug: "skincare" },
  { name: "Makeup", icon: "💄", slug: "makeup" },
  { name: "Men's Grooming", icon: "🧔", slug: "mens-grooming" },
  { name: "Eye Makeup", icon: "👁️", slug: "eye-makeup" },
  { name: "Serums & Essences", icon: "💧", slug: "serums-essences" },
  { name: "Cleansers", icon: "🫧", slug: "cleansers" },
  { name: "Body Care", icon: "🧴", slug: "body-care" },
];

export const brands = ["TonyMoly", "Medicube", "Zaron", "Mixsoon", "COSRX", "Skin by Zaron"];

export const products: Product[] = [
  {
    id: "1",
    name: "Ceramide Mochi Toner",
    brand: "TonyMoly",
    price: 18500,
    originalPrice: 22000,
    image: ceramideToner,
    category: "skincare",
    subcategory: "Toners",
    rating: 4.8,
    reviews: 124,
    description: "A hydrating toner infused with ceramides and mochi rice extract to deeply moisturize and strengthen the skin barrier. Leaves skin bouncy, plump, and radiant.",
    ingredients: "Water, Glycerin, Ceramide NP, Oryza Sativa (Rice) Extract, Niacinamide, Hyaluronic Acid, Panthenol",
    howToUse: "After cleansing, pour a small amount onto cotton pad or palms and gently pat onto face and neck.",
    skinType: ["Dry", "Normal", "Combination"],
    badges: ["Best Seller", "K-Beauty"],
    inStock: true,
  },
  {
    id: "2",
    name: "TXA Niacinamide Capsule Cream",
    brand: "Medicube",
    price: 32000,
    originalPrice: 38000,
    image: niacinamideCream,
    category: "skincare",
    subcategory: "Moisturizers",
    rating: 4.9,
    reviews: 89,
    description: "A powerful brightening cream with Tranexamic Acid and Niacinamide capsules that melt into skin. Targets dark spots, uneven tone, and dullness.",
    ingredients: "Tranexamic Acid, Niacinamide, Adenosine, Panthenol, Ceramide NP, Hyaluronic Acid",
    howToUse: "Apply after serum, gently massage capsules into skin until fully absorbed.",
    skinType: ["All Skin Types"],
    badges: ["New Arrival", "K-Beauty"],
    inStock: true,
  },
  {
    id: "3",
    name: "Liquid Eyeliner",
    brand: "Zaron",
    price: 5500,
    image: liquidEyeliner,
    category: "eye-makeup",
    rating: 4.6,
    reviews: 203,
    description: "Ultra-precise liquid eyeliner with a fine tip for sharp wings and defined lines. Waterproof, smudge-proof, lasts all day.",
    howToUse: "Shake well before use. Draw along the lash line from inner to outer corner. Build for desired intensity.",
    badges: ["Best Seller"],
    inStock: true,
  },
  {
    id: "4",
    name: "Smokey Eyeshadow Palette",
    brand: "Zaron",
    price: 15000,
    originalPrice: 18000,
    image: eyeshadowPalette,
    category: "eye-makeup",
    rating: 4.7,
    reviews: 156,
    description: "12-shade eyeshadow palette with matte, shimmer, and glitter finishes. Highly pigmented, blendable formula in warm earthy and smokey tones.",
    howToUse: "Use the included brush or your fingertip to apply. Build color gradually for desired intensity.",
    badges: ["Top Rated"],
    inStock: true,
  },
  {
    id: "5",
    name: "Volume Mascara",
    brand: "Zaron",
    price: 6500,
    image: mascara,
    category: "eye-makeup",
    rating: 4.5,
    reviews: 178,
    description: "Volumizing mascara that delivers dramatic, full lashes without clumping. Buildable formula for natural to bold looks.",
    howToUse: "Wiggle the wand from root to tip in a zigzag motion. Apply 2-3 coats for more volume.",
    inStock: true,
  },
  {
    id: "6",
    name: "Bean Essence",
    brand: "Mixsoon",
    price: 24000,
    originalPrice: 28000,
    image: beanEssence,
    category: "serums-essences",
    rating: 4.9,
    reviews: 312,
    description: "A fermented soybean essence that delivers deep nourishment and hydration. Rich in amino acids and antioxidants for glowing, youthful skin.",
    ingredients: "Glycine Max (Soybean) Seed Extract (96.3%), Glycerin, 1,2-Hexanediol, Water",
    howToUse: "After toning, apply 2-3 drops to palm and press gently into skin. Layer with moisturizer.",
    skinType: ["All Skin Types"],
    badges: ["Best Seller", "K-Beauty"],
    inStock: true,
  },
  {
    id: "7",
    name: "Salicylic Acid Cleanser",
    brand: "COSRX",
    price: 12000,
    image: salicylicCleanser,
    category: "cleansers",
    rating: 4.7,
    reviews: 245,
    description: "A gentle daily cleanser with 0.5% Salicylic Acid and tea tree oil that effectively removes impurities without stripping the skin. Perfect for acne-prone skin.",
    ingredients: "Salicylic Acid 0.5%, Tea Tree Oil, Betaine Salicylate, Water, Glycerin",
    howToUse: "Wet face with lukewarm water. Lather a small amount and massage gently. Rinse thoroughly.",
    skinType: ["Oily", "Combination", "Acne-Prone"],
    badges: ["K-Beauty"],
    inStock: true,
  },
  {
    id: "8",
    name: "Perfect Finish Setting Spray",
    brand: "Zaron",
    price: 8500,
    image: settingSpray,
    category: "makeup",
    rating: 4.4,
    reviews: 98,
    description: "Lightweight setting spray that locks in makeup for up to 16 hours. Gives a natural, dewy finish and keeps makeup looking fresh all day.",
    howToUse: "Hold 8-10 inches from face. Spray in X and T motion after completing makeup application.",
    inStock: true,
  },
  {
    id: "9",
    name: "Men Body Wash",
    brand: "Skin by Zaron",
    price: 7500,
    image: mensBodyWash,
    category: "mens-grooming",
    subcategory: "Body Care",
    rating: 4.3,
    reviews: 67,
    description: "A refreshing charcoal-infused body wash that deeply cleanses and detoxifies. Masculine scent with activated charcoal for thorough cleansing.",
    howToUse: "Apply to wet skin using a washcloth or hands. Lather and rinse thoroughly.",
    inStock: true,
  },
  {
    id: "10",
    name: "Men Face & Body Lotion",
    brand: "Skin by Zaron",
    price: 8000,
    image: mensLotion,
    category: "mens-grooming",
    subcategory: "Moisturizers",
    rating: 4.4,
    reviews: 54,
    description: "A lightweight, fast-absorbing lotion formulated for men's skin. Hydrates without greasiness, with a subtle masculine fragrance.",
    howToUse: "Apply generously after showering to face and body. Massage until fully absorbed.",
    inStock: true,
  },
];

export const formatPrice = (price: number) => {
  return `GH₵${price.toLocaleString()}`;
};
