'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface StockNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSlug: string;
  productTitle: string;
  size: string;
}

export default function StockNotificationModal({
  isOpen,
  onClose,
  productSlug,
  productTitle,
  size,
}: StockNotificationModalProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState(session?.user?.email || '');
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=stockNotification")
      .then((res) => res.json())
      .then((data) => {
        const contentMap: Record<string, string> = {};
        data.content?.forEach((item: any) => {
          contentMap[item.key] = item.value;
        });
        setContent(contentMap);
      })
      .catch((error) => {
        console.error("Error fetching content:", error);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(content["stockNotification.emailRequired"] || 'Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSlug,
          size,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success(data.message || 'You will be notified when this item is back in stock!');

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        toast.error(data.error || (content["stockNotification.error"] || 'Failed to join waitlist. Please try again.'));
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error(content["stockNotification.error"] || 'Failed to join waitlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Bell className="w-6 h-6 text-brand-orange" />
            {content["stockNotification.title"] || "Join Waitlist"}
          </DialogTitle>
          <DialogDescription>
            {content["stockNotification.description"] || "Get notified when this item is back in stock"}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{content["stockNotification.success.title"] || "You're on the list!"}</h3>
            <p className="text-gray-600">
              {content["stockNotification.success.message"] || "We'll send you an email as soon as this item is back in stock."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <p className="font-semibold text-sm text-gray-700 mb-1">{content["stockNotification.product.label"] || "Product"}</p>
              <p className="font-bold text-lg">{productTitle}</p>
              <p className="text-sm text-gray-600 mt-1">
                {content["stockNotification.size.label"] || "Size: "}<span className="font-semibold">{size}</span>
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {content["stockNotification.email.label"] || "Email Address"}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={content["stockNotification.email.placeholder"] || "your@email.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!session?.user?.email}
              />
              {session?.user?.email && (
                <p className="text-xs text-gray-500">{content["stockNotification.email.helper"] || "Using your account email"}</p>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-4">
              <p className="font-semibold text-sm mb-2">{content["stockNotification.benefits.title"] || "What you'll get:"}</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                  {content["stockNotification.benefits.instant"] || "Instant email notification when back in stock"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                  {content["stockNotification.benefits.exclusive"] || "Exclusive 24-hour early access before general release"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                  {content["stockNotification.benefits.noSpam"] || "No spam - only one notification per product"}
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                {content["stockNotification.cancel"] || "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={loading || !email}
                className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {content["stockNotification.joining"] || "Joining..."}
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    {content["stockNotification.notify"] || "Notify Me"}
                  </>
                )}
              </Button>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center">
              {content["stockNotification.privacy"] || "By clicking \"Notify Me\", you agree to receive restock notifications via email.\nYou can unsubscribe anytime."}
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
