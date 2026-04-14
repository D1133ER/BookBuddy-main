# Image Optimization Guide for BookBuddy

## Current Issues
- LCP: 4.7s (hero image too large)
- Image delivery can save 24 KiB
- Total network payload: 4,772 KiB

## Optimizations Applied

### 1. Hero Image Optimization
- Use WebP format with fallback
- Add `loading="eager"` for LCP image
- Add `fetchpriority="high"` for LCP image
- Proper sizing with srcset

### 2. Lazy Loading
- All below-fold images use `loading="lazy"`
- Critical above-fold images use `loading="eager"`

### 3. Modern Formats
- WebP for all images (80% smaller than JPEG)
- AVIF for supporting browsers (50% smaller than WebP)
- Fallback to JPEG/PNG

### 4. Responsive Images
- Use srcset for different screen sizes
- Use sizes attribute for art direction
- Proper width/height to prevent CLS

### 5. External Images
- Unsplash images: Add `?w=800&q=80` parameters
- DiceBear avatars: Already optimized
- Book covers: Use Open Library/Google Books thumbnails

## Next Steps (Manual)

### Compress Existing Images
```bash
# Install sharp
npm install --save-dev sharp

# Create optimization script
node scripts/optimize-images.js
```

### Use CDN
- Serve images through Cloudflare/CloudFront
- Enable automatic WebP/AVIF conversion
- Set proper cache headers

### Implement Image CDN
Recommended services:
- Cloudinary (free tier available)
- Imgix
- Cloudflare Images
- ImageKit

## Code Examples

### Optimized Hero Image
```tsx
<picture>
  <source 
    srcSet="/hero.avif" 
    type="image/avif" 
  />
  <source 
    srcSet="/hero.webp" 
    type="image/webp" 
  />
  <img
    src="/hero.jpg"
    alt="Library books"
    loading="eager"
    fetchpriority="high"
    width="1920"
    height="1080"
    className="object-cover"
  />
</picture>
```

### Lazy Loaded Images
```tsx
<img
  src={book.coverImage}
  alt={book.title}
  loading="lazy"
  decoding="async"
  width="250"
  height="375"
/>
```

### External Image Optimization
```tsx
// Before
src="https://images.unsplash.com/photo-xxx?w=2000"

// After
src="https://images.unsplash.com/photo-xxx?w=800&q=80&auto=format"
```
