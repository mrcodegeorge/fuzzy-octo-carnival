import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-beauty.jpg";
import heroModel from "@/assets/hero-model.jpg";
import heroProduct from "@/assets/hero-product.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="container relative grid min-h-screen grid-cols-1 items-center gap-8 py-12 lg:grid-cols-12 lg:py-0">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 lg:col-span-5"
        >
          <div className="flex items-center gap-3">
            <div className="editorial-line" />
            <span className="font-accent text-xs font-medium tracking-[0.3em] text-muted-foreground uppercase">
              New Collection 2026
            </span>
          </div>

          <h1 className="mt-6 font-heading text-5xl font-bold leading-[0.95] tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Make Your
            <br />
            <span className="italic">Beauty</span>
            <br />
            <span className="text-primary">Gl</span>
            <span className="inline-flex h-[0.85em] w-[0.85em] rounded-full border-[3px] border-primary" />
            <span className="text-primary">w</span>
          </h1>

          <p className="mt-6 max-w-sm font-accent text-sm leading-relaxed text-muted-foreground">
            Premium skincare & beauty products. Authentic Korean beauty,
            international cosmetics, and expert-curated collections delivered across Ghana.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/shop" className="btn-beauty group">
              Explore Collections
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/shop?category=skincare" className="btn-beauty-outline">
              Shop Skincare
            </Link>
          </div>

          {/* Blog teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex h-10 w-10 items-center justify-center border border-border">
              <ArrowRight size={14} />
            </div>
            <div>
              <p className="font-accent text-[10px] tracking-wider text-muted-foreground uppercase">
                Blog · Beauty Tips
              </p>
              <p className="text-sm font-semibold">
                Trendy Skincare Routines For The Season
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right editorial collage */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative lg:col-span-7"
        >
          <div className="relative mx-auto h-[500px] w-full max-w-[600px] lg:h-[85vh] lg:max-w-none">
            {/* Main image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute left-[10%] top-[8%] z-10 h-[55%] w-[50%] overflow-hidden"
            >
              <img
                src={heroModel}
                alt="Beauty editorial"
                className="h-full w-full object-cover"
                width={800}
                height={1000}
              />
            </motion.div>

            {/* Product image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute bottom-[5%] left-[0%] z-20 h-[35%] w-[35%] overflow-hidden border-4 border-background"
            >
              <img
                src={heroProduct}
                alt="Featured product"
                className="h-full w-full object-cover"
                loading="lazy"
                width={600}
                height={800}
              />
            </motion.div>

            {/* Flatlay image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute right-[0%] top-[20%] z-10 h-[45%] w-[45%] overflow-hidden"
            >
              <img
                src={heroImage}
                alt="Beauty products flatlay"
                className="h-full w-full object-cover"
                loading="lazy"
                width={1920}
                height={1080}
              />
            </motion.div>

            {/* Decorative star */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute left-[42%] top-[15%] z-30"
            >
              <svg width="40" height="40" viewBox="0 0 40 40" className="text-foreground">
                <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17Z" fill="currentColor" />
              </svg>
            </motion.div>

            {/* Small decorative star */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[35%] left-[50%] z-30"
            >
              <svg width="20" height="20" viewBox="0 0 40 40" className="text-foreground">
                <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17Z" fill="currentColor" />
              </svg>
            </motion.div>

            {/* Circular text badge */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[15%] right-[15%] z-30"
            >
              <svg width="100" height="100" viewBox="0 0 100 100" className="text-foreground">
                <path
                  id="circlePath"
                  d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
                  fill="none"
                />
                <text className="fill-current text-[11px] font-semibold tracking-[0.15em]" style={{ fontFamily: 'var(--font-accent)' }}>
                  <textPath href="#circlePath">
                    EXPLORE MORE · ARRIVALS ·{" "}
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Year display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute right-0 top-[5%] z-20 text-right"
            >
              <div className="font-heading text-6xl font-light leading-none tracking-tighter text-foreground/15 lg:text-8xl">
                <div>2</div>
                <div>0</div>
                <div>2</div>
                <div>6</div>
              </div>
              <div className="mt-2 text-foreground/30">↓</div>
            </motion.div>

            {/* NEW ARRIVALS text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-[40%] left-[-5%] z-20"
            >
              <p className="font-accent text-xs font-bold tracking-[0.2em] text-foreground uppercase">
                NEW
              </p>
              <p className="font-accent text-xs font-bold tracking-[0.2em] text-foreground uppercase">
                ARRIVALS
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
