# Deployment Guide for BookBuddy

This guide covers deploying BookBuddy to various production environments.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git repository
- Domain name (optional but recommended)

## 1. Build the Application

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

The production-ready files will be in the `dist/` folder.

## 2. Deployment Options

### Option A: Vercel (Recommended)

Vercel is the easiest way to deploy React/Vite applications.

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Production Deployment**
   ```bash
   vercel --prod
   ```

**Automatic Deployments:**
- Connect your GitHub repository to Vercel
- Every push to main branch will auto-deploy
- Set environment variables in Vercel dashboard

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Configuration File**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Option C: GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.ts**
   ```typescript
   export default defineConfig({
     base: '/BookBuddy/', // Your repo name
     // ... rest of config
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option D: Docker

1. **Create Dockerfile**
   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
       listen 80;
       server_name _;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
   }
   ```

3. **Build and Run**
   ```bash
   docker build -t bookbuddy .
   docker run -p 80:80 bookbuddy
   ```

### Option E: AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-bookbuddy-bucket
   ```

2. **Enable Static Hosting**
   ```bash
   aws s3 website s3://your-bookbuddy-bucket \
     --index-document index.html \
     --error-document index.html
   ```

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://your-bookbuddy-bucket
   ```

4. **Set Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bookbuddy-bucket/*"
       }
     ]
   }
   ```

5. **Create CloudFront Distribution**
   - Point to S3 bucket
   - Enable HTTPS
   - Set up custom domain

## 3. Environment Variables

Set environment variables in your deployment platform:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=BookBuddy
# VITE_GOOGLE_BOOKS_API_KEY=your_key_here
```

**Platform-specific setup:**
- **Vercel**: Settings → Environment Variables
- **Netlify**: Site settings → Build & deploy → Environment
- **GitHub Actions**: Repository settings → Secrets
- **Docker**: Use `.env` file or `--env-file` flag

## 4. Custom Domain Setup

### Vercel
1. Go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as instructed

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Update DNS records

### CloudFront
1. Create SSL certificate in AWS Certificate Manager
2. Add alternate domain name to CloudFront
3. Update DNS with Route 53

## 5. SSL/HTTPS

All modern deployment platforms provide free SSL certificates automatically:
- **Vercel**: Automatic HTTPS
- **Netlify**: Automatic HTTPS with Let's Encrypt
- **CloudFront**: Use AWS Certificate Manager
- **GitHub Pages**: Automatic with custom domain

## 6. Post-Deployment Checklist

- [ ] Test all routes and navigation
- [ ] Verify authentication flow
- [ ] Test form submissions
- [ ] Check mobile responsiveness
- [ ] Verify API connections
- [ ] Test error boundaries
- [ ] Check browser console for errors
- [ ] Verify environment variables
- [ ] Test performance (Lighthouse)
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics
- [ ] Configure backups
- [ ] Set up monitoring

## 7. Performance Optimization

### Enable Compression
Most platforms enable gzip/brotli automatically.

### Configure Caching
```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Use CDN
- Vercel and Netlify include CDN by default
- For other platforms, use CloudFront or Cloudflare

## 8. Monitoring & Analytics

### Error Tracking
```bash
npm install @sentry/react @sentry/tracing
```

Initialize in `main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn-here",
  environment: import.meta.env.MODE,
});
```

### Analytics
- Google Analytics
- Plausible Analytics
- Fathom Analytics

## 9. Continuous Integration/Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 10. Rollback Strategy

### Vercel
```bash
vercel rollback
```

### Netlify
- Use dashboard to restore previous deploy
- Or redeploy from specific commit

### Manual
- Keep previous build artifacts
- Use Git tags for releases
- Maintain deployment logs

## 11. Database Setup (If Using PostgreSQL)

### Using the Provided Docker Compose

```bash
# Start database
npm run db:start

# Run migrations (when you have them)
# psql -U admin -d bookbuddy -f db/init.sql
```

### Production Database
- Use managed database (AWS RDS, Supabase, Neon)
- Set up connection pooling
- Configure backups
- Enable SSL connections

## 12. Security Hardening

1. **Enable Security Headers** (see SECURITY.md)
2. **Set up CORS** on backend
3. **Rate limiting** on API
4. **Regular dependency updates**
5. **Security audits**: `npm audit`
6. **HTTPS only**
7. **Secure cookies** (when backend added)

## 13. Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf node_modules .vite dist
npm install
npm run build
```

### Routes Not Working
- Ensure server is configured for SPA routing
- All routes should serve `index.html`

### Environment Variables Not Working
- Check they're set in deployment platform
- Variables must start with `VITE_`
- Rebuild after changing variables

## 14. Support

For deployment issues:
1. Check platform documentation
2. Review build logs
3. Test locally first
4. Check environment variables
5. Verify DNS settings

## 15. Cost Estimates

- **Vercel**: Free tier available, Pro $20/month
- **Netlify**: Free tier available, Pro $19/month
- **AWS**: ~$5-15/month (S3 + CloudFront)
- **DigitalOcean**: ~$5/month (App Platform)
- **Docker**: Varies by hosting provider

Choose the option that best fits your needs and budget!
