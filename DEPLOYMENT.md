# Deployment Guide - Isocom CRM

## Vercel Deployment

This project is ready for deployment on Vercel. Follow these steps:

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
VITE_API_BASE_URL=http://172.30.150.162:8001/api
VITE_APP_NAME=Isocom CRM
VITE_APP_VERSION=1.0.0
```

### 2. Vercel Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Deployment Steps

1. **Connect to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite framework

2. **Set Environment Variables:**

   - In Vercel dashboard, go to your project settings
   - Add the environment variables from step 1
   - Make sure to set `VITE_API_BASE_URL` to your production API URL

3. **Deploy:**
   - Vercel will automatically build and deploy your project
   - The build command `npm run build` will be executed
   - Output will be served from the `dist` directory

### 4. Build Information

- **Framework:** Vite + React + TypeScript
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+ (recommended)

### 5. API Configuration

The application uses environment variables for API configuration:

- `VITE_API_BASE_URL`: Base URL for the backend API
- Default fallback: `http://172.30.150.162:8001/api`

### 6. Features

- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Production build optimization
- ✅ SPA routing support
- ✅ Environment variable configuration
- ✅ Responsive design
- ✅ Modern UI components

### 7. Troubleshooting

If deployment fails:

1. Check environment variables are set correctly
2. Ensure API URL is accessible from Vercel
3. Verify build command runs successfully locally
4. Check Vercel build logs for specific errors

### 8. Performance Notes

- Bundle size: ~1.2MB (gzipped: ~328KB)
- Consider implementing code splitting for larger applications
- All static assets are optimized for production
