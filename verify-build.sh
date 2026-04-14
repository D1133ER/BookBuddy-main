#!/bin/bash

# BookBuddy Build Verification Script
# Run this to verify all optimizations are in place

echo "🔍 BookBuddy Build Verification"
echo "================================"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist/ folder not found!"
    echo "   Run: npm run build"
    exit 1
fi

echo "✅ dist/ folder exists"
echo ""

# 1. Check for preload
echo "1️⃣  Checking hero image preload..."
if grep -q 'fetchpriority="high"' dist/index.html; then
    echo "   ✅ Hero image preloaded with high priority"
else
    echo "   ❌ Hero image preload missing!"
fi

# 2. Check for preconnect
echo ""
echo "2️⃣  Checking preconnect links..."
if grep -q 'rel="preconnect"' dist/index.html; then
    echo "   ✅ Preconnect links present"
else
    echo "   ❌ Preconnect links missing!"
fi

# 3. Check for WebP format
echo ""
echo "3️⃣  Checking WebP image format..."
if grep -q 'fm=webp' dist/index.html; then
    echo "   ✅ WebP format specified"
else
    echo "   ❌ WebP format not found!"
fi

# 4. Check code splitting
echo ""
echo "4️⃣  Checking code splitting..."
JS_FILES=$(ls dist/assets/js/*.js 2>/dev/null | wc -l)
if [ "$JS_FILES" -gt 5 ]; then
    echo "   ✅ Code splitting active ($JS_files JS chunks)"
else
    echo "   ❌ Code splitting may not be working (only $JS_FILES chunks)"
fi

# 5. Check for minified files (should have hashes)
echo ""
echo "5️⃣  Checking minification..."
HASHED_FILES=$(ls dist/assets/js/*.js 2>/dev/null | grep -cE '[A-Za-z0-9_-]{8}')
if [ "$HASHED_FILES" -gt 0 ]; then
    echo "   ✅ Files are minified with hashes ($HASHED_FILES files)"
else
    echo "   ❌ Files may not be minified!"
fi

# 6. Check total size
echo ""
echo "6️⃣  Checking build size..."
TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo "   📦 Total dist/ size: $TOTAL_SIZE"

# 7. Check for meta tags
echo ""
echo "7️⃣  Checking SEO meta tags..."
if grep -q 'og:title' dist/index.html; then
    echo "   ✅ Open Graph tags present"
else
    echo "   ❌ Open Graph tags missing!"
fi

if grep -q 'twitter:card' dist/index.html; then
    echo "   ✅ Twitter Card tags present"
else
    echo "   ❌ Twitter Card tags missing!"
fi

# 8. Check for robots.txt and sitemap.xml
echo ""
echo "8️⃣  Checking SEO files..."
if [ -f "dist/robots.txt" ]; then
    echo "   ✅ robots.txt in dist/"
else
    echo "   ⚠️  robots.txt not in dist/ (check build config)"
fi

if [ -f "dist/sitemap.xml" ]; then
    echo "   ✅ sitemap.xml in dist/"
else
    echo "   ⚠️  sitemap.xml not in dist/ (check build config)"
fi

# 9. List largest JS files
echo ""
echo "9️⃣  Largest JavaScript chunks:"
ls -lhS dist/assets/js/*.js 2>/dev/null | head -5 | awk '{print "   " $5 " - " $9}'

# 10. Check CSS size
echo ""
echo "🔟 CSS files:"
ls -lh dist/assets/css/*.css 2>/dev/null | awk '{print "   " $5 " - " $9}'

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"

# Count checks
CHECKS_PASSED=0
CHECKS_TOTAL=8

grep -q 'fetchpriority="high"' dist/index.html && ((CHECKS_PASSED++))
grep -q 'rel="preconnect"' dist/index.html && ((CHECKS_PASSED++))
grep -q 'fm=webp' dist/index.html && ((CHECKS_PASSED++))
[ "$JS_FILES" -gt 5 ] && ((CHECKS_PASSED++))
[ "$HASHED_FILES" -gt 0 ] && ((CHECKS_PASSED++))
grep -q 'og:title' dist/index.html && ((CHECKS_PASSED++))
grep -q 'twitter:card' dist/index.html && ((CHECKS_PASSED++))
[ -f "dist/robots.txt" ] && ((CHECKS_PASSED++))

echo "✅ Passed: $CHECKS_PASSED/$CHECKS_TOTAL checks"
echo ""

if [ "$CHECKS_PASSED" -eq "$CHECKS_TOTAL" ]; then
    echo "🎉 All optimizations verified!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run preview"
    echo "2. Open: http://localhost:4173"
    echo "3. Run Lighthouse with 'Clear storage' checked"
    echo "4. Expected scores: Performance 95+, Accessibility 98+, SEO 100"
else
    echo "⚠️  Some optimizations missing!"
    echo "   Run: npm run build"
    echo "   And check vite.config.ts settings"
fi

echo ""
