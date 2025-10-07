from pathlib import Path
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Determine the environment and load the corresponding .env file
env_path = Path('..') / f'.env'
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv('SECRET_KEY')


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ["localhost", "backend", "proxy",]
ALLOWED_HOSTS.append(os.getenv('DOMAIN', '')) # this is the domain that you configure in your .env file

CSRF_TRUSTED_ORIGINS = ['http://localhost']
CSRF_TRUSTED_ORIGINS.append('https://' + os.getenv('DOMAIN', ''))
CSRF_TRUSTED_ORIGINS.append('http://' + os.getenv('DOMAIN', ''))

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.facebook",
    "allauth.mfa",
    "allauth.headless",
    "allauth.usersessions",
    "rest_framework",
    "djstripe",
    "user_auth",
    "payments",
    "contactus",
    "sample"
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',

]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, 'user_auth/templates')],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STATIC_URL = "django-static/"

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

if DEBUG:
    EMAIL_HOST = "mail"
    EMAIL_PORT = 1025
else:
    EMAIL_HOST = os.getenv("EMAIL_HOST")
    EMAIL_USE_TLS = True
    EMAIL_PORT = os.getenv("EMAIL_PORT")
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
    EMAIL_BACKEND = os.getenv("EMAIL_BACKEND")
    
#If you prefer to use another email service, check out 
# https://github.com/anymail/django-anymail for more information

DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL")

ACCOUNT_EMAIL_SUBJECT_PREFIX = ''

AUTHENTICATION_BACKENDS = ("allauth.account.auth_backends.AuthenticationBackend",)

ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*']
ACCOUNT_LOGOUT_ON_PASSWORD_CHANGE = False
ACCOUNT_LOGIN_BY_CODE_ENABLED = False
ACCOUNT_ADAPTER = 'user_auth.adapters.CustomAccountAdapter'
ACCOUNT_EMAIL_CONFIRMATION_HTML = True  # Enables HTML emails for account confirmation
ACCOUNT_EMAIL_NOTIFICATIONS = True # Security notifications on email change, password change, etc.

HEADLESS_ONLY = True
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "/account/verify-email/{key}",
    "account_reset_password": "/account/password/reset",
    "account_reset_password_from_key": "/account/password/reset/key/{key}",
    "account_signup": "/account/signup",
    "socialaccount_login_error": "/account/provider/callback",
}

MFA_SUPPORTED_TYPES = ["totp", "recovery_codes",]
MFA_PASSKEY_LOGIN_ENABLED = True


STRIPE_LIVE_SECRET_KEY = os.getenv("STRIPE_API_KEY_LIVE")
STRIPE_TEST_SECRET_KEY = os.getenv("STRIPE_API_KEY_TEST")
STRIPE_LIVE_MODE = os.getenv("STRIPE_LIVE_MODE", "False") == "True"
DJSTRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")  # Get it from the section in the Stripe dashboard where you added the webhook endpoint
DJSTRIPE_FOREIGN_KEY_TO_FIELD = "id"

# The following settings are for the contact us form
# You can set SEND_EMAIL_FOR_CONTACT_US to False if you don't want to send an email when the contact us form is submitted
# CONTACT_US_RECIPIENT_EMAIL is the email address that will receive the email when the contact us form is submitted
SEND_EMAIL_FOR_CONTACT_US = True
CONTACT_US_RECIPIENT_EMAIL = os.getenv("CONTACT_US_RECIPIENT_EMAIL")
ACCOUNT_REAUTHENTICATION_REQUIRED = False

# These are used for the email templates
COMPANY_NAME = 'Your Company Name'
COMPANY_ADDRESS = '123 Company Street, City, Country 12345'

# URLs
PRIVACY_POLICY_URL = f'https://{os.getenv('DOMAIN')}/privacy-policy'
TERMS_OF_SERVICE_URL = f'https://{os.getenv('DOMAIN')}/terms-of-service'
CONTACT_URL = f'https://{os.getenv('DOMAIN')}/'

SOCIALACCOUNT_PROVIDERS = {

}

if os.getenv("GOOGLE_CLIENT_ID") and os.getenv("GOOGLE_CLIENT_SECRET"):
    SOCIALACCOUNT_PROVIDERS['google'] = {
        'APP': {
            'client_id': os.getenv("GOOGLE_CLIENT_ID"),
            'secret': os.getenv("GOOGLE_CLIENT_SECRET"),
            'key': '' # you can leave these blank
        }
    }

if os.getenv("FACEBOOK_APP_ID") and os.getenv("FACEBOOK_APP_SECRET"):
    SOCIALACCOUNT_PROVIDERS['facebook'] = {
        'APP': {
            'client_id': os.getenv("FACEBOOK_APP_ID"),
            'secret': os.getenv("FACEBOOK_APP_SECRET"),
            'key': '' # you can leave these blank
        }
    }
    
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}


try:
    from .local_settings import *  # noqa
except ImportError:
    pass
