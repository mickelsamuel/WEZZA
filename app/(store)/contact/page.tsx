import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, MessageCircle } from "lucide-react";
import { getContentBySection } from "@/lib/site-content";

export default async function ContactPage() {
  const content = await getContentBySection("contact");

  const FAQS = [
    {
      question: content["contact.faq1.question"] || "What are your shipping times?",
      answer: content["contact.faq1.answer"] || "Standard orders ship within 1-2 business days and arrive in 5-7 business days. Custom orders take 2-3 weeks to produce, plus shipping time. We offer free shipping on all orders over $100 CAD.",
    },
    {
      question: content["contact.faq2.question"] || "What is your return policy?",
      answer: content["contact.faq2.answer"] || "We accept returns within 30 days of delivery for unworn, unwashed items with original tags attached. Custom orders are final sale and cannot be returned. Please email us to initiate a return.",
    },
    {
      question: content["contact.faq3.question"] || "How do your hoodies fit?",
      answer: content["contact.faq3.answer"] || "Our hoodies have a modern, slightly relaxed fit. They're true to size with room for comfortable layering. Check our size guide on each product page for detailed measurements. If you prefer an oversized look, we recommend sizing up.",
    },
    {
      question: content["contact.faq4.question"] || "How should I care for my WEZZA hoodie?",
      answer: content["contact.faq4.answer"] || "Machine wash cold with like colors, tumble dry low. Do not bleach. Our premium heavyweight cotton is built to last—it will actually get softer and more comfortable with each wash while maintaining its shape.",
    },
    {
      question: content["contact.faq5.question"] || "Do you ship internationally?",
      answer: content["contact.faq5.answer"] || "Currently we ship to Canada and the United States. We're working on expanding our shipping to international destinations. Sign up for our newsletter to be notified when we expand to your region.",
    },
    {
      question: content["contact.faq6.question"] || "How does custom ordering work?",
      answer: content["contact.faq6.answer"] || "Fill out our custom order form with your design details. We'll review your request and email you within 24 hours with pricing, mockups, and timeline. Once approved, production takes 2-3 weeks. Minimum order is 1 piece.",
    },
  ];
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-heading text-4xl font-bold md:text-5xl">
          {content["contact.pageTitle"] || "Contact & FAQ"}
        </h1>

        {/* Contact Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-brand-orange" />
            <h2 className="mt-4 font-heading text-xl font-bold">
              {content["contact.email.title"] || "Email Us"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {content["contact.email.description"] || "For general inquiries and support"}
            </p>
            <a
              href={`mailto:${content["contact.email.address"] || "wezza28711@gmail.com"}`}
              className="mt-4 inline-block font-semibold text-brand-orange hover:underline"
            >
              {content["contact.email.address"] || "wezza28711@gmail.com"}
            </a>
          </Card>

          <Card className="p-8 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-brand-orange" />
            <h2 className="mt-4 font-heading text-xl font-bold">
              {content["contact.custom.title"] || "Custom Orders"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {content["contact.custom.description"] || "Questions about custom designs?"}
            </p>
            <a
              href={`mailto:${content["contact.custom.address"] || "wezza28711@gmail.com"}`}
              className="mt-4 inline-block font-semibold text-brand-orange hover:underline"
            >
              {content["contact.custom.address"] || "wezza28711@gmail.com"}
            </a>
          </Card>
        </div>

        {/* FAQ Section */}
        <div id="faq">
          <h2 className="mb-6 font-heading text-3xl font-bold">
            {content["contact.faq.title"] || "Frequently Asked Questions"}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Additional Info */}
        <div className="mt-12 rounded-2xl bg-brand-peach/20 p-8">
          <h3 className="font-heading text-2xl font-bold">
            {content["contact.footer.title"] || "Still have questions?"}
          </h3>
          <p className="mt-2 text-muted-foreground">
            {content["contact.footer.text"] || "We're here to help. Email us at"}{" "}
            <a
              href={`mailto:${content["contact.email.address"] || "wezza28711@gmail.com"}`}
              className="font-semibold text-brand-orange hover:underline"
            >
              {content["contact.email.address"] || "wezza28711@gmail.com"}
            </a>{" "}
            {content["contact.footer.response"] || "and we'll get back to you within 24 hours."}
          </p>
        </div>
      </div>
    </div>
  );
}
