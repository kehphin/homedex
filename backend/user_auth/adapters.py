from allauth.account.adapter import DefaultAccountAdapter
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class CustomAccountAdapter(DefaultAccountAdapter):
    """
        You can override methods on the DefaultAccountAdapter here.
    """
    # We are adding settings to our email context to provide consistent 
    # branding across all emails.
    def render_mail(self, template_prefix, email, context):
        context.update({
            'company_name': settings.COMPANY_NAME,
            'company_address': settings.COMPANY_ADDRESS,
            'privacy_policy_url': settings.PRIVACY_POLICY_URL,
            'terms_of_service_url': settings.TERMS_OF_SERVICE_URL,
            'contact_url': settings.CONTACT_URL,
        })
        return super().render_mail(template_prefix, email, context)
