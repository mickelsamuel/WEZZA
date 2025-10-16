"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

const HOODIE_SIZES = [
  { size: "XS", chest: "18", length: "26", sleeve: "32" },
  { size: "S", chest: "20", length: "27", sleeve: "33" },
  { size: "M", chest: "22", length: "28", sleeve: "34" },
  { size: "L", chest: "24", length: "29", sleeve: "35" },
  { size: "XL", chest: "26", length: "30", sleeve: "36" },
  { size: "2XL", chest: "28", length: "31", sleeve: "37" },
];

export function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Size Guide - Hoodies</DialogTitle>
          <DialogDescription>
            All measurements are in inches. If you're between sizes, we recommend sizing up for a more relaxed fit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">Size</th>
                  <th className="px-4 py-3 text-left font-semibold">Chest Width</th>
                  <th className="px-4 py-3 text-left font-semibold">Length</th>
                  <th className="px-4 py-3 text-left font-semibold">Sleeve Length</th>
                </tr>
              </thead>
              <tbody>
                {HOODIE_SIZES.map((item) => (
                  <tr key={item.size} className="border-b hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{item.size}</td>
                    <td className="px-4 py-3">{item.chest}"</td>
                    <td className="px-4 py-3">{item.length}"</td>
                    <td className="px-4 py-3">{item.sleeve}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* How to Measure Section */}
          <div className="space-y-4 rounded-lg bg-muted/50 p-4">
            <h3 className="font-semibold">How to Measure</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="font-medium text-sm">Chest Width</p>
                <p className="text-sm text-muted-foreground">
                  Measure across the chest from armpit to armpit
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Length</p>
                <p className="text-sm text-muted-foreground">
                  Measure from the highest point of the shoulder to the bottom hem
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Sleeve Length</p>
                <p className="text-sm text-muted-foreground">
                  Measure from the center back of the neck to the end of the sleeve
                </p>
              </div>
            </div>
          </div>

          {/* Fit Guide */}
          <div className="space-y-2">
            <h3 className="font-semibold">Fit Guide</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Our hoodies are designed for a relaxed, comfortable fit</li>
              <li>Made from heavyweight 100% cotton (400 GSM)</li>
              <li>Pre-shrunk fabric ensures consistent sizing after washing</li>
              <li>For an oversized look, we recommend sizing up</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-muted-foreground">
            Still not sure? Contact us at{" "}
            <a href="mailto:support@wezza.com" className="text-brand-orange hover:underline">
              support@wezza.com
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
