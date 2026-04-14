# 🔒 Security Headers Implementation Guide

## ⚠️ Critical Information

**Security headers CANNOT be set via `<meta>` tags in HTML.** 

The following headers **MUST** be set via HTTP response headers from your server:
- `Content-Security-Policy` (CSP)
- `HTTP Strict Transport Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`
- `Permissions-Policy`
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

---

## ✅ Where to Configure Security Headers

### Option 1: **Apache (.htaccess)** ✅ Ready to Use

**Location:** `public/.htaccess` (already configured)

**How it works:**
```apache
<IfModule mod_headers.c>
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Content-Security-Policy "..."
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
```

**Deployment:**
```bash
# Just copy the dist folder to your web root
# .htaccess is automatically included
cp -r dist/* /var/www/html/
```

**Required Apache modules:**
```bash
sudo a2enmod headers rewrite expires deflate
sudo systemctl restart apache2
```

---

### Option 2: **Nginx (nginx.conf)** ✅ Ready to Use

**Location:** `nginx.conf` (already configured)

**How it works:**
```nginx
server {
    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "..." always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
}
```

**Deployment:**
```bash
# Copy config to Nginx
sudo cp nginx.conf /etc/nginx/sites-available/bookbuddy
sudo ln -s /etc/nginx/sites-available/bookbuddy /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

### Option 3: **Vercel (vercel.json)**

**Create `vercel.json` in project root:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://api.dicebear.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

---

### Option 4: **Netlify (netlify.toml)**

**Create `netlify.toml` in project root:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://images.unsplash.com https://api.dicebear.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
```

---

## 🧪 Testing Security Headers

### 1. **Using Browser DevTools**
```bash
# Open Chrome DevTools (F12)
# Go to Network tab
# Refresh page
# Click on the main document request
# Check "Response Headers" section
```

### 2. **Using curl**
```bash
curl -I https://yourdomain.com
```

**Expected output:**
```
HTTP/2 200
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; ...
permissions-policy: camera=(), microphone=(), geolocation=()
```

### 3. **Online Tools**
- **Security Headers Scanner:** https://securityheaders.com/
- **Mozilla Observatory:** https://observatory.mozilla.org/
- **SSL Labs:** https://www.ssllabs.com/ssltest/

### 4. **Using Lighthouse**
- Run Lighthouse audit
- Check "Best Practices" section
- Should show "Uses safe and secure HTTP headers"

---

## 📋 Security Headers Explained

### 1. **Content-Security-Policy (CSP)**
**Purpose:** Prevents XSS attacks by controlling which resources can load

**What it does:**
- Restricts where scripts, styles, images can load from
- Prevents inline scripts (unless explicitly allowed)
- Blocks framing from other domains

**BookBuddy Configuration:**
```
default-src 'self' - Only allow resources from same origin
script-src 'self' 'unsafe-inline' 'unsafe-eval' - Allow scripts from same origin
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com - Allow styles from Google Fonts
img-src 'self' data: https://images.unsplash.com https://api.dicebear.com - Allow images from Unsplash & DiceBear
```

### 2. **HTTP Strict Transport Security (HSTS)**
**Purpose:** Forces browsers to use HTTPS only

**What it does:**
- Prevents protocol downgrade attacks
- Protects against cookie hijacking
- Tells browser to always use HTTPS for 1 year

### 3. **X-Frame-Options: DENY**
**Purpose:** Prevents clickjacking attacks

**What it does:**
- Blocks your site from being embedded in iframes
- Prevents other sites from framing your content

### 4. **X-Content-Type-Options: nosniff**
**Purpose:** Prevents MIME type sniffing

**What it does:**
- Forces browser to respect declared Content-Type
- Prevents executing scripts disguised as other file types

### 5. **X-XSS-Protection**
**Purpose:** Enables browser's built-in XSS filter

**What it does:**
- Stops page from loading if XSS attack is detected
- Legacy protection (modern browsers rely on CSP)

### 6. **Referrer-Policy**
**Purpose:** Controls referrer information sent with requests

**What it does:**
- `strict-origin-when-cross-origin` - Send full URL for same-origin, only origin for cross-origin
- Protects user privacy

### 7. **Permissions-Policy**
**Purpose:** Controls which browser features can be used

**What it does:**
- Disables camera, microphone, geolocation
- Prevents abuse of sensitive browser APIs

---

## 🔧 Troubleshooting

### Issue: Headers not appearing
**Solutions:**
1. **Apache:** Ensure `mod_headers` is enabled
   ```bash
   sudo a2enmod headers
   sudo systemctl restart apache2
   ```

2. **Nginx:** Check config syntax
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Vercel/Netlify:** Verify JSON/TOML syntax

### Issue: CSP blocking legitimate resources
**Solution:**
- Check browser console for CSP violations
- Add allowed domains to CSP directive
- Example: If Google Fonts blocked, add `https://fonts.googleapis.com` to `style-src`

### Issue: Mixed content warnings
**Solution:**
- Ensure all resources use HTTPS
- Update any `http://` URLs to `https://`
- Check external API calls

---

## 🎯 Best Practices

### ✅ DO:
- Always use HTTPS in production
- Set HSTS with long max-age (1 year)
- Use strict CSP policies
- Test headers before deploying
- Monitor CSP violation reports

### ❌ DON'T:
- Don't use `<meta>` tags for security headers (they don't work)
- Don't use `X-Frame-Options: ALLOWALL`
- Don't allow `unsafe-inline` in CSP unless necessary
- Don't forget to test on all deployment platforms

---

## 📊 Security Headers Checklist

Before deploying to production:

- [ ] Security headers configured in server config
- [ ] CSP allows all required external resources
- [ ] HSTS enabled with proper max-age
- [ ] X-Frame-Options set to DENY or SAMEORIGIN
- [ ] Headers verified with curl or browser DevTools
- [ ] Tested with https://securityheaders.com/
- [ ] No CSP violations in browser console
- [ ] All resources loading over HTTPS

---

## 🚀 Quick Start

**For most users, just use the provided configuration files:**

### Apache:
```bash
# Files already configured:
public/.htaccess  # Contains all security headers

# Just deploy:
npm run build
cp -r dist/* /var/www/html/
```

### Nginx:
```bash
# File already configured:
nginx.conf  # Contains all security headers

# Deploy:
npm run build
sudo cp -r dist/* /var/www/bookbuddy/
sudo cp nginx.conf /etc/nginx/sites-available/bookbuddy
sudo ln -s /etc/nginx/sites-available/bookbuddy /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Vercel:
```bash
# Create vercel.json (see example above)
vercel --prod
```

---

## 📚 Additional Resources

- [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory)
- [Security Headers Guide](https://securityheaders.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)

---

**Remember:** Security headers are your first line of defense against common web attacks. Always configure them at the server level, never in HTML! 🔒
