from django.db import models

# Create your models here.
class UserCustomer(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='stripe_customers')
    customer = models.OneToOneField("djstripe.Customer", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'customer')

    def __str__(self):
        return f"{self.user.username} - {self.customer.id}"
