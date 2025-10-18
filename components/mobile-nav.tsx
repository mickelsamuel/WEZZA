"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  onAuthModalOpen?: () => void;
}

export function MobileNav({ isOpen, onClose, links, onAuthModalOpen }: MobileNavProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=mobileNav")
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div className="fixed inset-0 z-[101] bg-black/50" onClick={onClose} />
      <div className="fixed right-0 top-0 z-[102] h-full w-3/4 max-w-sm bg-white dark:bg-gray-950 p-6 shadow-2xl border-l overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {content["mobileNav.menu"] || "Menu"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5 text-foreground" />
          </Button>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`rounded-md px-4 py-3 font-medium transition-colors ${
                pathname === link.href
                  ? "bg-brand-orange text-white"
                  : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth Section */}
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            {status === "authenticated" ? (
              <div className="flex flex-col gap-3">
                <div className="px-4 py-2">
                  <p className="font-medium text-foreground">{session?.user?.name || "User"}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="rounded-md px-4 py-3 font-medium text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {content["mobileNav.myAccount"] || "My Account"}
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    onClose();
                  }}
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {content["mobileNav.signOut"] || "Sign Out"}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  onClose();
                  onAuthModalOpen?.();
                }}
                className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
              >
                <User className="mr-2 h-5 w-5" />
                {content["mobileNav.signIn"] || "Sign In"}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
