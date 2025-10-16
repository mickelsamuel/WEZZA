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
  const [profile, setProfile] = useState<SizingProfile>({
    heightCm: '',
    weightKg: '',
    chestCm: '',
    preferredFit: 'regular',
  });

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
      toast.error('Please enter your height and weight');
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
        throw new Error('Failed to calculate size');
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
      toast.error('Failed to calculate recommended size');
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
            Find Your Perfect Size
          </DialogTitle>
          <DialogDescription>
            Enter your measurements to get a personalized size recommendation
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Recommended Size Display */}
            {recommendedSize && (
              <div className="bg-brand-orange/10 border-2 border-brand-orange rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Your Recommended Size</p>
                    <p className="text-3xl font-bold text-brand-orange mt-1">{recommendedSize}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-brand-orange" />
                </div>
                {sizeGuide[recommendedSize as keyof typeof sizeGuide] && (
                  <div className="mt-3 pt-3 border-t border-brand-orange/20">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Chest:</span> {sizeGuide[recommendedSize as keyof typeof sizeGuide].chest} •{' '}
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
                Height (cm) *
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 175"
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
                Weight (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
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
                Chest Measurement (cm) <span className="text-xs text-gray-500 ml-1">(optional)</span>
              </Label>
              <Input
                id="chest"
                type="number"
                placeholder="e.g., 105"
                value={profile.chestCm}
                onChange={(e) => setProfile({ ...profile, chestCm: e.target.value ? Number(e.target.value) : '' })}
                min="80"
                max="150"
              />
              <p className="text-xs text-gray-500">Measure around the fullest part of your chest</p>
            </div>

            {/* Preferred Fit */}
            <div className="space-y-3">
              <Label>Preferred Fit</Label>
              <RadioGroup
                value={profile.preferredFit}
                onValueChange={(value) => setProfile({ ...profile, preferredFit: value as 'slim' | 'regular' | 'oversized' })}
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="slim" id="slim" />
                  <Label htmlFor="slim" className="flex-1 cursor-pointer">
                    <span className="font-medium">Slim Fit</span>
                    <p className="text-xs text-gray-500">Closer to body, more fitted</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="flex-1 cursor-pointer">
                    <span className="font-medium">Regular Fit</span>
                    <p className="text-xs text-gray-500">Classic, comfortable fit</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="oversized" id="oversized" />
                  <Label htmlFor="oversized" className="flex-1 cursor-pointer">
                    <span className="font-medium">Oversized Fit</span>
                    <p className="text-xs text-gray-500">Relaxed, roomy fit</p>
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
                {loading ? 'Calculating...' : recommendedSize ? 'Recalculate Size' : 'Calculate My Size'}
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
                  Use This Size
                </Button>
              )}
            </div>

            {/* Size Guide Reference */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3 text-sm">Full Size Guide</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(sizeGuide).map(([size, measurements]) => (
                  <div
                    key={size}
                    className={`p-2 border rounded ${
                      recommendedSize === size ? 'border-brand-orange bg-brand-orange/5' : 'border-gray-200'
                    }`}
                  >
                    <p className="font-bold text-sm">{size}</p>
                    <p className="text-gray-600">Chest: {measurements.chest}</p>
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
