import { motion } from "framer-motion";

const PrivacyPolicyPage = () => (
  <div className="section-padding">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-bold md:text-5xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 2026</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p className="mt-2">When you use Tillies Avenue, we may collect: your name, email address, phone number, delivery address, and payment information (Mobile Money number). We also collect usage data such as pages visited and products viewed to improve your experience.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <ul className="mt-2 space-y-1.5 pl-4">
            <li className="list-disc">To process and deliver your orders</li>
            <li className="list-disc">To send order confirmations and shipping updates</li>
            <li className="list-disc">To provide customer support</li>
            <li className="list-disc">To personalize your shopping experience</li>
            <li className="list-disc">To send promotional offers (only with your consent)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">3. Data Sharing</h2>
          <p className="mt-2">We do not sell, trade, or rent your personal information to third parties. We may share your data with delivery partners solely for the purpose of fulfilling your orders.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">4. Data Security</h2>
          <p className="mt-2">We implement industry-standard security measures to protect your personal data. Payment information is processed securely and never stored on our servers.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">5. Your Rights</h2>
          <p className="mt-2">You may request to view, update, or delete your personal data at any time by contacting us at hello@tilliesavenue.com. You can also unsubscribe from marketing communications at any time.</p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">6. Contact Us</h2>
          <p className="mt-2">For any privacy-related questions, contact us at hello@tilliesavenue.com or via WhatsApp.</p>
        </section>
      </motion.div>
    </div>
  </div>
);

export default PrivacyPolicyPage;
