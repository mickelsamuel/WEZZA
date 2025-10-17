'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Ruler, User, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SizeRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSizeRecommended?: (size: string) => void;
}

interface SizingProfile {
  heightCm: number | '';
  weightKg: number | '';
  chestCm: number | '';
  preferredFit: 'slim' | 'regular' | 'oversized';
}

export default function SizeRecommendationModal({
  isOpen,
  onClose,
  onSizeRecommended,
}: SizeRecommendationModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [recommendedSize, setRecommendedSize] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<SizingProfile>({
    heightCm: '',
    weightKg: '',
    chestCm: '',
    preferredFit: 'regular',
  });

  // Load site content
  useEffect(() => {
    fetch("/api/site-content?section=sizeRec")
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

  // Load existing profile
  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await fetch('/api/sizing-profile');

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile({
            heightCm: data.profile.heightCm || '',
            weightKg: data.profile.weightKg || '',
            chestCm: data.profile.chestCm || '',
            preferredFit: data.profile.preferredFit || 'regular',
          });
          if (data.profile.recommendedSize) {
            setRecommendedSize(data.profile.recommendedSize);
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleCalculate = async () => {
    if (!profile.heightCm || !profile.weightKg) {
      toast.error(content["sizeRec.error.requiredFields"] || 'Please enter your height and weight');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sizing-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heightCm: Number(profile.heightCm),
          weightKg: Number(profile.weightKg),
          chestCm: profile.chestCm ? Number(profile.chestCm) : null,
          preferredFit: profile.preferredFit,
        }),
      });

      if (!response.ok) {
        throw new Error(content["sizeRec.error.calculateFailed"] || 'Failed to calculate size');
      }

      const data = await response.json();
      setRecommendedSize(data.profile.recommendedSize);
      toast.success(data.message);

      // Notify parent component
      if (onSizeRecommended) {
        onSizeRecommended(data.profile.recommendedSize);
      }
    } catch (error) {
      console.error('Error calculating size:', error);
      toast.error(content["sizeRec.error.calculationError"] || 'Failed to calculate recommended size');
    } finally {
      setLoading(false);
    }
  };

  const sizeGuide = {
    S: { chest: '96-101 cm', length: '68 cm', shoulder: '46 cm' },
    M: { chest: '101-107 cm', length: '70 cm', shoulder: '49 cm' },
    L: { chest: '107-112 cm', length: '72 cm', shoulder: '52 cm' },
    XL: { chest: '112-117 cm', length: '74 cm', shoulder: '55 cm' },
    XXL: { chest: '117-122 cm', length: '76 cm', shoulder: '58 cm' },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Ruler className="w-6 h-6" />
            {content["sizeRec.title"] || "Find Your Perfect Size"}
          </DialogTitle>
          <DialogDescription>
            {content["sizeRec.description"] || "Enter your measurements to get a personalized size recommendation"}
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">{content["sizeRec.loadingProfile"] || "Loading your profile..."}</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Recommended Size Display */}
            {recommendedSize && (
              <div className="bg-brand-orange/10 border-2 border-brand-orange rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{content["sizeRec.recommended"] || "Your Recommended Size"}</p>
                    <p className="text-3xl font-bold text-brand-orange mt-1">{recommendedSize}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-brand-orange" />
                </div>
                {sizeGuide[recommendedSize as keyof typeof sizeGuide] && (
                  <div className="mt-3 pt-3 border-t border-brand-orange/20">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">{content["sizeRec.chest"] || "Chest: "}</span>{sizeGuide[recommendedSize as keyof typeof sizeGuide].chest} •{' '}
                      <span className="font-semibold">Length:</span> {sizeGuide[recommendedSize as keyof typeof sizeGuide].length} •{' '}
                      <span className="font-semibold">Shoulder:</span> {sizeGuide[recommendedSize as keyof typeof sizeGuide].shoulder}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Height Input */}
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {content["sizeRec.height.label"] || "Height (cm) *"}
              </Label>
              <Input
                id="height"
                type="number"
                placeholder={content["sizeRec.height.placeholder"] || "e.g., 175"}
                value={profile.heightCm}
                onChange={(e) => setProfile({ ...profile, heightCm: e.target.value ? Number(e.target.value) : '' })}
                min="140"
                max="220"
              />
            </div>

            {/* Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {content["sizeRec.weight.label"] || "Weight (kg) *"}
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder={content["sizeRec.weight.placeholder"] || "e.g., 70"}
                value={profile.weightKg}
                onChange={(e) => setProfile({ ...profile, weightKg: e.target.value ? Number(e.target.value) : '' })}
                min="40"
                max="200"
              />
            </div>

            {/* Chest Measurement (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="chest" className="flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                {content["sizeRec.chest.label"] || "Chest Measurement (cm) (optional)"}
              </Label>
              <Input
                id="chest"
                type="number"
                placeholder={content["sizeRec.chest.placeholder"] || "e.g., 105"}
                value={profile.chestCm}
                onChange={(e) => setProfile({ ...profile, chestCm: e.target.value ? Number(e.target.value) : '' })}
                min="80"
                max="150"
              />
              <p className="text-xs text-gray-500">{content["sizeRec.chest.help"] || "Measure around the fullest part of your chest"}</p>
            </div>

            {/* Preferred Fit */}
            <div className="space-y-3">
              <Label>{content["sizeRec.fit.label"] || "Preferred Fit"}</Label>
              <RadioGroup
                value={profile.preferredFit}
                onValueChange={(value) => setProfile({ ...profile, preferredFit: value as 'slim' | 'regular' | 'oversized' })}
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="slim" id="slim" />
                  <Label htmlFor="slim" className="flex-1 cursor-pointer">
                    <span className="font-medium">{content["sizeRec.fit.slim.title"] || "Slim Fit"}</span>
                    <p className="text-xs text-gray-500">{content["sizeRec.fit.slim.desc"] || "Closer to body, more fitted"}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="flex-1 cursor-pointer">
                    <span className="font-medium">{content["sizeRec.fit.regular.title"] || "Regular Fit"}</span>
                    <p className="text-xs text-gray-500">{content["sizeRec.fit.regular.desc"] || "Classic, comfortable fit"}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="oversized" id="oversized" />
                  <Label htmlFor="oversized" className="flex-1 cursor-pointer">
                    <span className="font-medium">{content["sizeRec.fit.oversized.title"] || "Oversized Fit"}</span>
                    <p className="text-xs text-gray-500">{content["sizeRec.fit.oversized.desc"] || "Relaxed, roomy fit"}</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCalculate}
                disabled={loading || !profile.heightCm || !profile.weightKg}
                className="flex-1 bg-brand-orange hover:bg-brand-orange/90"
              >
                {loading ? (content["sizeRec.calculating"] || 'Calculating...') : recommendedSize ? (content["sizeRec.recalculate"] || 'Recalculate Size') : (content["sizeRec.calculate"] || 'Calculate My Size')}
              </Button>
              {recommendedSize && onSizeRecommended && (
                <Button
                  onClick={() => {
                    onSizeRecommended(recommendedSize);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  {content["sizeRec.useSize"] || "Use This Size"}
                </Button>
              )}
            </div>

            {/* Size Guide Reference */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3 text-sm">{content["sizeRec.fullGuide"] || "Full Size Guide"}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(sizeGuide).map(([size, measurements]) => (
                  <div
                    key={size}
                    className={`p-2 border rounded ${
                      recommendedSize === size ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200'
                    }`}
                  >
                    <p className="font-bold text-sm">{size}</p>
                    <p className="text-gray-600">{content["sizeRec.chest"] || "Chest: "}{measurements.chest}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
