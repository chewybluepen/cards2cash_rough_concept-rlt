import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/ui/bottom-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  const { user } = useAuth();

  const faqs = [
    {
      question: "How do I add funds to my account?",
      answer: "You can add funds by navigating to the 'Add Funds' page and entering your prepaid phone credit code. The funds will be automatically converted and added to your balance.",
    },
    {
      question: "How do I generate a virtual card?",
      answer: "Go to the 'Virtual Cards' page, click on 'New Card', enter the desired amount, and your virtual card will be generated instantly with all the necessary details.",
    },
    {
      question: "What currencies are supported?",
      answer: "We currently support GYD (Guyanese Dollar), USD (US Dollar), EUR (Euro), and GBP (British Pound) for currency conversion.",
    },
    {
      question: "How secure are the virtual cards?",
      answer: "Our virtual cards are generated with secure encryption and are valid for one-time use only. The card details are only visible to you and are stored securely.",
    },
    {
      question: "What are the transaction limits?",
      answer: "Transaction limits vary based on your account status. Standard accounts can convert up to 100,000 GYD per day. Contact support for higher limits.",
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container p-4">
        <h1 className="text-2xl font-bold mb-6">Help Center</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you can't find the answer to your question, please contact our support team at{" "}
              <a href="mailto:support@cards2cash.com" className="text-primary">
                support@cards2cash.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
