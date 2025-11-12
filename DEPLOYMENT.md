# Production Deployment Guide

## Overview

This guide explains how to deploy your Homedex application to production with separate domains for frontend and backend.

## Architecture

- **Frontend**: `https://app.homedex.app` (React SPA)
- **Backend**: `https://api.homedex.app` (Django API)
- **Marketing**: `https://homedex.app` (Astro static site)

## Environment Variables

### Frontend (app.homedex.app)

Set these environment variables in your Coolify frontend deployment:

```bash
REACT_APP_HOST=https://api.homedex.app
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY_HERE
```

**Important**: `REACT_APP_HOST` must point to your **backend API domain**, not the frontend domain.

### Backend (api.homedex.app)

Set these environment variables in your Coolify backend deployment:

```bash
# Database
POSTGRES_DB=your_production_db
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
DB_HOST=db
DB_PORT=5432

# Django
SECRET_KEY=your-super-secure-secret-key-here
DEBUG=False
DOMAIN=api.homedex.app
FRONTEND_URL=https://app.homedex.app

# Stripe
STRIPE_API_KEY_LIVE=sk_live_YOUR_KEY
STRIPE_LIVE_MODE=True
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Email (example with Mailgun)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=noreply@homedex.app
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.homedex.app
EMAIL_HOST_PASSWORD=your-mailgun-password

# Contact form
CONTACT_US_RECIPIENT_EMAIL=support@homedex.app

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=homedex-files
AWS_S3_REGION_NAME=us-east-2

# Optional: Social auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### Astro Marketing Site (homedex.app)

```bash
PUBLIC_ASTRO_DOMAIN=https://homedex.app
PUBLIC_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_KEY_HERE
```

## Deployment Steps

### 0. Configure S3 for File Storage (Optional but Recommended)

For production, it's recommended to use AWS S3 for storing uploaded documents:

1. **Create S3 Bucket**:

   - Go to AWS S3 Console
   - Create a bucket (e.g., `homedex-files`)
   - Note the region (e.g., `us-east-2`)

2. **Create IAM User**:

   - Go to IAM Console
   - Create a user with S3 permissions
   - Generate Access Key ID and Secret Access Key

3. **Configure CORS on S3 Bucket**:

   - In S3 bucket settings, add CORS configuration:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["https://app.homedex.app"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

4. **Set Environment Variables**:
   - `AWS_ACCESS_KEY_ID`: Your IAM user's access key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret key
   - `AWS_STORAGE_BUCKET_NAME`: Your bucket name
   - `AWS_S3_REGION_NAME`: Your S3 region

For detailed instructions, see [S3_SETUP.md](S3_SETUP.md)

### 1. Update Environment Variables

- Update all environment variables in Coolify for each service
- Double-check that `REACT_APP_HOST` points to `https://api.homedex.app`
- Ensure `FRONTEND_URL` in backend points to `https://app.homedex.app`

### 2. Deploy Backend First

1. Push your code changes to your repository
2. Trigger a rebuild of the backend service in Coolify
3. Wait for deployment to complete
4. Check logs for any errors

### 3. Deploy Frontend

1. Trigger a rebuild of the frontend service in Coolify
2. Wait for deployment to complete
3. The build process will use the correct environment variables

### 4. Verify CORS Configuration

After deployment, verify that:

- Frontend can make API calls to backend
- Cookies/sessions work across domains
- No CORS errors in browser console

## Troubleshooting

### Issue: "CORS policy" errors in browser console

**Solution**:

- Check that `FRONTEND_URL` is set correctly in backend
- Verify `django-cors-headers` is installed: `pip list | grep cors`
- Check Django logs for CORS-related errors

### Issue: Static files not loading (404 errors)

**Solution**:

- Verify the frontend build completed successfully
- Check that `PUBLIC_URL=/` is set in the Dockerfile
- Inspect the built `index.html` to ensure paths don't have double `/static/`

### Issue: Authentication not working across domains

**Solution**:

- Ensure `CORS_ALLOW_CREDENTIALS = True` in Django settings
- Verify `CSRF_TRUSTED_ORIGINS` includes your frontend domain
- Check browser cookies - they should be set with appropriate domain

### Issue: API calls going to wrong domain

**Solution**:

- Verify `REACT_APP_HOST` is set correctly in Coolify
- Rebuild the frontend (environment variables are baked in at build time)
- Check browser Network tab to see where requests are going

## Security Checklist

- [ ] `DEBUG=False` in production backend
- [ ] Strong `SECRET_KEY` (64+ random characters)
- [ ] Secure database passwords
- [ ] HTTPS enabled for all domains
- [ ] Stripe live mode keys (not test keys)
- [ ] Email service configured correctly
- [ ] CORS configured to only allow your frontend domain
- [ ] `ALLOWED_HOSTS` includes your backend domain

## Key Changes Made

### Frontend Changes

1. **Dockerfile.prod**: Added `ENV PUBLIC_URL=/` to fix static asset paths
2. **apiUtils.ts**: Modified to prepend `REACT_APP_HOST` to API calls

### Backend Changes

1. **requirements.txt**: Added `django-cors-headers==4.3.1`
2. **settings.py**:
   - Added `corsheaders` to `INSTALLED_APPS`
   - Added `CorsMiddleware` to `MIDDLEWARE`
   - Added `CORS_ALLOWED_ORIGINS` configuration
   - Added `CORS_ALLOW_CREDENTIALS = True`
   - Added `FRONTEND_URL` to `CSRF_TRUSTED_ORIGINS`

## Testing in Production

After deployment, test these scenarios:

1. **Authentication Flow**:

   - Sign up with email
   - Verify email
   - Log in
   - Log out

2. **API Calls**:

   - Check browser Network tab
   - Verify all API calls go to `api.homedex.app`
   - Ensure no CORS errors

3. **Static Assets**:

   - Check that all JS/CSS files load correctly
   - Verify no 404 errors in console
   - Test that the app is interactive

4. **Stripe Integration**:
   - Test checkout flow
   - Verify webhooks are received

## Support

If you encounter issues not covered in this guide:

1. Check Coolify deployment logs
2. Check browser console for errors
3. Check Django logs in Coolify
4. Verify all environment variables are set correctly
