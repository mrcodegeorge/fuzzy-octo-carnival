import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const wishlisted = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="product-card group relative bg-card"
    >
      <Link to={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-foreground uppercase font-accent">
              -{discount}%
            </span>
          )}
          {product.badges?.map((badge) => (
            <span key={badge} className="bg-foreground px-2.5 py-1 text-[10px] font-bold text-background uppercase font-accent">
              {badge}
            </span>
          ))}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist.mutate(product.id); }}
            className={`flex h-9 w-9 items-center justify-center shadow-sm transition-colors ${
              wishlisted
                ? "bg-primary text-primary-foreground"
                : "bg-background/90 text-foreground hover:bg-foreground hover:text-background"
            }`}
          >
            <Heart size={14} className={wishlisted ? "fill-current" : ""} />
          </button>
        </div>
        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/90 p-3 text-center transition-transform duration-300 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
            className="flex w-full items-center justify-center gap-2 font-accent text-xs font-semibold text-background uppercase tracking-wider"
          >
            <ShoppingBag size={14} /> Add to Bag
          </button>
        </div>
      </Link>

      <div className="p-4">
        <p className="font-accent text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {product.brand}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="mt-1 text-sm font-medium leading-tight text-foreground hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1">
          <Star size={11} className="fill-primary text-primary" />
          <span className="font-accent text-[11px] text-muted-foreground">
            {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-accent text-sm font-bold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="font-accent text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
