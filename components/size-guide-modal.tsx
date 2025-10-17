"use client";

import { useState, useEffect } from "react";
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
  const [content, setContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-content?section=sizeGuide")
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="h-4 w-4" />
          {content["sizeGuide.button"] || "Size Guide"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{content["sizeGuide.title"] || "Size Guide - Hoodies"}</DialogTitle>
          <DialogDescription>
            {content["sizeGuide.description"] || "All measurements are in inches. If you're between sizes, we recommend sizing up for a more relaxed fit."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Size Chart Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">{content["sizeGuide.table.size"] || "Size"}</th>
                  <th className="px-4 py-3 text-left font-semibold">{content["sizeGuide.table.chest"] || "Chest Width"}</th>
                  <th className="px-4 py-3 text-left font-semibold">{content["sizeGuide.table.length"] || "Length"}</th>
                  <th className="px-4 py-3 text-left font-semibold">{content["sizeGuide.table.sleeve"] || "Sleeve Length"}</th>
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
            <h3 className="font-semibold">{content["sizeGuide.howToMeasure"] || "How to Measure"}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="font-medium text-sm">{content["sizeGuide.measure.chest.label"] || "Chest Width"}</p>
                <p className="text-sm text-muted-foreground">
                  {content["sizeGuide.measure.chest.instruction"] || "Measure across the chest from armpit to armpit"}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">{content["sizeGuide.measure.length.label"] || "Length"}</p>
                <p className="text-sm text-muted-foreground">
                  {content["sizeGuide.measure.length.instruction"] || "Measure from the highest point of the shoulder to the bottom hem"}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">{content["sizeGuide.measure.sleeve.label"] || "Sleeve Length"}</p>
                <p className="text-sm text-muted-foreground">
                  {content["sizeGuide.measure.sleeve.instruction"] || "Measure from the center back of the neck to the end of the sleeve"}
                </p>
              </div>
            </div>
          </div>

          {/* Fit Guide */}
          <div className="space-y-2">
            <h3 className="font-semibold">{content["sizeGuide.fitGuide"] || "Fit Guide"}</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>{content["sizeGuide.fit.relaxed"] || "Our hoodies are designed with a slightly relaxed fit for maximum comfort"}</li>
              <li>{content["sizeGuide.fit.preshrunk"] || "All garments are pre-shrunk to minimize further shrinkage"}</li>
              <li>{content["sizeGuide.fit.between"] || "Between sizes? Size up for a more oversized look"}</li>
              <li>{content["sizeGuide.fit.model"] || "Model is 6'0\" and wearing size Large"}</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="text-center text-sm text-muted-foreground">
            {content["sizeGuide.contact.text"] || "Still not sure? Contact us at"}{" "}
            <a href={`mailto:${content["sizeGuide.contact.email"] || "support@wezza.com"}`} className="text-brand-orange hover:underline">
              {content["sizeGuide.contact.email"] || "support@wezza.com"}
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
