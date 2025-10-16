#!/bin/bash

# Generate placeholder images for WEZZA store
# Requires ImageMagick: brew install imagemagick

echo "Generating placeholder product images..."

# Product images (800x800)
convert -size 800x800 xc:#000000 -pointsize 60 -fill white -gravity center \
  -annotate +0+0 "Lunar\nBlack" public/images/products/lunar-black-1.jpg
convert -size 800x800 xc:#000000 public/images/products/lunar-black-2.jpg
convert -size 800x800 xc:#000000 public/images/products/lunar-black-3.jpg

convert -size 800x800 xc:#000000 -pointsize 60 -fill white -gravity center \
  -annotate +0+0 "Core\nBlack" public/images/products/core-black-1.jpg
convert -size 800x800 xc:#000000 public/images/products/core-black-2.jpg
convert -size 800x800 xc:#000000 public/images/products/core-black-3.jpg

convert -size 800x800 xc:#FAD4C0 -pointsize 60 -fill black -gravity center \
  -annotate +0+0 "Core\nPeach" public/images/products/core-peach-1.jpg
convert -size 800x800 xc:#FAD4C0 public/images/products/core-peach-2.jpg
convert -size 800x800 xc:#FAD4C0 public/images/products/core-peach-3.jpg

convert -size 800x800 xc:#E37025 -pointsize 60 -fill white -gravity center \
  -annotate +0+0 "Core\nOrange" public/images/products/core-brown-1.jpg
convert -size 800x800 xc:#E37025 public/images/products/core-brown-2.jpg
convert -size 800x800 xc:#E37025 public/images/products/core-brown-3.jpg

convert -size 800x800 xc:#DCDCDC -pointsize 60 -fill black -gravity center \
  -annotate +0+0 "Core\nGray" public/images/products/core-gray-1.jpg
convert -size 800x800 xc:#DCDCDC public/images/products/core-gray-2.jpg
convert -size 800x800 xc:#DCDCDC public/images/products/core-gray-3.jpg

convert -size 800x800 xc:#FFFFFF -pointsize 60 -fill black -gravity center \
  -annotate +0+0 "Lunar\nWhite" public/images/products/lunar-white-1.jpg
convert -size 800x800 xc:#FFFFFF public/images/products/lunar-white-2.jpg
convert -size 800x800 xc:#FFFFFF public/images/products/lunar-white-3.jpg

convert -size 800x800 xc:#000000 -pointsize 60 -fill white -gravity center \
  -annotate +0+0 "Custom\nBlack" public/images/products/custom-black-1.jpg
convert -size 800x800 xc:#000000 public/images/products/custom-black-2.jpg

convert -size 800x800 xc:#FFFFFF -pointsize 60 -fill black -gravity center \
  -annotate +0+0 "Custom\nWhite" public/images/products/custom-white-1.jpg
convert -size 800x800 xc:#FFFFFF public/images/products/custom-white-2.jpg

echo "Generating Instagram placeholder images..."

# Instagram images (600x600)
for i in {1..6}; do
  convert -size 600x600 xc:#E37025 -pointsize 40 -fill white -gravity center \
    -annotate +0+0 "Instagram\n$i" public/images/instagram/$i.jpg
done

echo "Done! Placeholder images generated."
