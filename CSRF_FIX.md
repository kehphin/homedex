# CSRF Fix for Production

## Problem

You're getting "403 CSRF verification failed" when trying to sign up in production at `https://api.homedex.app/_allauth/browser/v1/auth/signup`.

## Root Cause

When making cross-origin requests (frontend on one domain, backend API on another), Django's CSRF cookies weren't being set properly due to:

1. Missing `SameSite=None` attribute on CSRF and session cookies
2. Missing `Secure` flag on cookies in production (HTTPS)
3. Potentially missing API domain configuration

## Changes Made to `backend/backend/settings.py`

Added the following cookie configurations:

```python
# Session and CSRF cookie settings for cross-origin requests
SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
SESSION_COOKIE_SECURE = not DEBUG  # True in production (HTTPS)
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_DOMAIN = None  # Let browser handle domain

CSRF_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
CSRF_COOKIE_SECURE = not DEBUG  # True in production (HTTPS)
CSRF_COOKIE_HTTPONLY = False  # Must be False so JavaScript can read it
CSRF_COOKIE_DOMAIN = None  # Let browser handle domain
```

Added API domain configuration:

```python
# Add API subdomain if different from main domain
API_DOMAIN = os.getenv('API_DOMAIN', '')
if API_DOMAIN and API_DOMAIN not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(API_DOMAIN)

# Add API domain to CSRF trusted origins
if API_DOMAIN:
    CSRF_TRUSTED_ORIGINS.append('https://' + API_DOMAIN)
    CSRF_TRUSTED_ORIGINS.append('http://' + API_DOMAIN)
```

## Environment Variables to Update

Add to your production `.env` file or environment configuration:

```bash
# Your existing variables
DOMAIN=homedex.app
FRONTEND_URL=https://homedex.app

# Add this new variable for your API domain
API_DOMAIN=api.homedex.app

# Ensure DEBUG is False in production
DEBUG=False
```

## What These Settings Do

### `SameSite=None`

- Allows cookies to be sent with cross-site requests (frontend → API)
- Required when frontend and backend are on different domains
- Only works with `Secure=True` (HTTPS)

### `Secure=True`

- Cookies only sent over HTTPS connections
- Required for `SameSite=None` to work
- Automatically set to `False` in DEBUG mode for local development

### `CSRF_COOKIE_HTTPONLY=False`

- Allows JavaScript to read the CSRF token from cookies
- Necessary because your frontend reads the token via `getCSRFToken()`
- Session cookie remains HttpOnly for security

## Deployment Steps

1. **Update your environment variables** in your production environment (Coolify, etc.):

   ```bash
   API_DOMAIN=api.homedex.app
   DEBUG=False
   ```

2. **Rebuild and restart your backend container**:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build backend
   ```

3. **Test the authentication flow**:
   - Open browser DevTools (Network tab)
   - Try to sign up
   - Check the response headers for `Set-Cookie`
   - Verify you see: `csrftoken=...; SameSite=None; Secure`

## Testing Checklist

After deployment, verify:

- [ ] Sign up form works without CSRF errors
- [ ] CSRF cookie is set with `SameSite=None; Secure`
- [ ] Session cookie is set with `SameSite=None; Secure`
- [ ] Login works correctly
- [ ] User can access authenticated routes
- [ ] API calls include CSRF token in headers

## Browser DevTools Verification

1. Open **Network tab** in DevTools
2. Submit signup form
3. Look at the response headers
4. You should see:
   ```
   Set-Cookie: csrftoken=...; Path=/; SameSite=None; Secure
   Set-Cookie: sessionid=...; HttpOnly; Path=/; SameSite=None; Secure
   ```

## Common Issues

### Issue: Still getting CSRF errors

**Solution**: Clear browser cookies and cache, then try again. Old cookies may interfere.

### Issue: Cookies not being set

**Solution**:

- Verify HTTPS is working (no mixed content)
- Check that `API_DOMAIN` matches your actual API domain
- Ensure `FRONTEND_URL` is set correctly

### Issue: CORS errors instead of CSRF errors

**Solution**: The existing CORS settings should handle this, but verify:

- `CORS_ALLOWED_ORIGINS` includes your frontend URL
- `CORS_ALLOW_CREDENTIALS = True` is set

## Why This Works

1. **Browser behavior**: By default, browsers don't send cookies with cross-origin requests
2. **SameSite=None**: Explicitly tells browsers to send cookies with cross-site requests
3. **Secure flag**: Required for SameSite=None, ensures cookies only sent over HTTPS
4. **CSRF_TRUSTED_ORIGINS**: Tells Django which origins are allowed to make CSRF-protected requests
5. **CORS_ALLOW_CREDENTIALS**: Tells browsers the server allows credentials (cookies) with CORS requests

## Additional Notes

- Development (DEBUG=True): Uses `SameSite=Lax` and `Secure=False` for easy local testing
- Production (DEBUG=False): Uses `SameSite=None` and `Secure=True` for cross-origin support
- The frontend already correctly reads the CSRF token from cookies and sends it in the `X-CSRFToken` header

## References

- [Django CSRF Documentation](https://docs.djangoproject.com/en/4.2/ref/csrf/)
- [MDN: SameSite cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Django Allauth Headless Documentation](https://docs.allauth.org/en/latest/headless/index.html)
