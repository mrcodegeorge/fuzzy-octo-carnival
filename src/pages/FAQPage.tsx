import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Orders within Accra are delivered within 1–2 business days. Orders to other regions typically take 3–5 business days depending on your location.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Mobile Money (MTN, Telecel, AirtelTigo) and Cash on Delivery (Accra only). Card payments are coming soon.",
  },
  {
    q: "Can I return a product?",
    a: "Yes, you can return unopened and sealed products within 7 days of delivery. Please contact us via WhatsApp or email with your order ID to initiate a return.",
  },
  {
    q: "Are your products authentic?",
    a: "Absolutely. We source all products directly from authorized distributors and brands. Every product on Tillies Avenue is 100% genuine.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is confirmed and shipped, we'll send you a WhatsApp message with tracking updates. You can also check your order status in your account page.",
  },
  {
    q: "Do you offer discounts for bulk purchases?",
    a: "Yes! Contact us for wholesale or bulk pricing. We offer special rates for beauty professionals and resellers.",
  },
  {
    q: "What if I receive a damaged product?",
    a: "Please contact us within 24 hours of delivery with photos of the damaged item. We'll arrange a replacement or refund at no extra cost.",
  },
  {
    q: "Do you ship outside Ghana?",
    a: "Currently, we only ship within Ghana. International shipping is planned for the future. Follow us on social media for updates!",
  },
];

const FAQPage = () => (
  <div className="section-padding">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="font-heading text-3xl font-bold md:text-5xl">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything you need to know about shopping with us</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-12">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-border bg-card px-6">
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </div>
);

export default FAQPage;
