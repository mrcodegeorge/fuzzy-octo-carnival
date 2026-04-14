import { motion } from "framer-motion";

const TermsPage = () => (
  <div className="section-padding">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold md:text-5xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p className="mt-2">By accessing and using Tillies Avenue (tilliesavenue.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">2. Products & Pricing</h2>
          <p className="mt-2">All product prices are listed in Ghana Cedis (GH₵) and include applicable taxes. We reserve the right to change prices at any time. Prices are confirmed at the time of order placement.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">3. Orders & Payment</h2>
          <p className="mt-2">By placing an order, you agree to provide accurate delivery and payment information. We reserve the right to cancel any order if we suspect fraudulent activity. Payment must be completed via the available methods: Mobile Money or Cash on Delivery.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">4. Delivery</h2>
          <p className="mt-2">Delivery timelines are estimates and may vary depending on your location and product availability. We are not liable for delays caused by circumstances beyond our control.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">5. Returns & Refunds</h2>
          <p className="mt-2">Products may be returned within 7 days of delivery if they are unopened and in original packaging. Refunds are processed within 3–5 business days of receiving the returned item. Shipping fees are non-refundable.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">6. Intellectual Property</h2>
          <p className="mt-2">All content on this website — including logos, text, images, and design — is the property of Tillies Avenue and is protected by copyright laws. Unauthorized use is prohibited.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">7. Limitation of Liability</h2>
          <p className="mt-2">Tillies Avenue shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">8. Contact</h2>
          <p className="mt-2">For questions about these terms, contact us at hello@tilliesavenue.com.</p>
        </section>
      </motion.div>
    </div>
  </div>
);

export default TermsPage;
