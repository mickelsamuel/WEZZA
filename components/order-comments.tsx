"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  userName: string;
  userRole: string;
  message: string;
  isAdminOnly: boolean;
  createdAt: string;
}

interface OrderCommentsProps {
  orderNumber: string;
}

export function OrderComments({ orderNumber }: OrderCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    fetchComments();
  }, [orderNumber]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/orders/${orderNumber}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          isAdminOnly,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setComments([...comments, data.comment]);
      setNewMessage("");
      setIsAdminOnly(false);
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-heading text-lg font-bold">Order Communication</h3>
        </div>
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-heading text-lg font-bold">Order Communication</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {isAdmin
          ? "Communicate with the customer about this order."
          : "Send messages to the store about your order."}
      </p>

      <Separator className="my-4" />

      {/* Messages */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          comments.map((comment) => {
            const isOwnMessage = session?.user?.role === comment.userRole;
            return (
              <div
                key={comment.id}
                className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}
              >
                <div className="shrink-0">
                  {comment.userRole === "admin" ? (
                    <div className="h-8 w-8 rounded-full bg-brand-orange flex items-center justify-center text-white">
                      <Shield className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className={`flex-1 ${isOwnMessage ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">{comment.userName}</span>
                    {comment.userRole === "admin" && (
                      <Badge variant="default" className="text-xs">Admin</Badge>
                    )}
                    {comment.isAdminOnly && isAdmin && (
                      <Badge variant="outline" className="text-xs">Internal Note</Badge>
                    )}
                  </div>
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      isOwnMessage
                        ? "bg-brand-orange text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Message */}
      {session && (
        <>
          <Separator className="my-4" />
          <div className="space-y-3">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              disabled={sending}
            />
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin-only"
                  checked={isAdminOnly}
                  onCheckedChange={(checked) => setIsAdminOnly(checked as boolean)}
                  disabled={sending}
                />
                <Label
                  htmlFor="admin-only"
                  className="text-sm cursor-pointer"
                >
                  Internal note (not visible to customer)
                </Label>
              </div>
            )}
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
