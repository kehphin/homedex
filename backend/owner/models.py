from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class HomeComponent(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    CATEGORY_CHOICES = [
        ('Appliances', 'Appliances'),
        ('HVAC', 'HVAC'),
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Roofing', 'Roofing'),
        ('Windows & Doors', 'Windows & Doors'),
        ('Flooring', 'Flooring'),
        ('Gutters', 'Gutters'),
        ('Water Heater', 'Water Heater'),
        ('Security System', 'Security System'),
        ('Garage Door', 'Garage Door'),
        ('Sump Pump', 'Sump Pump'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_components')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    year_installed = models.CharField(max_length=4, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    warranty_expiration = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    notes = models.TextField(blank=True)
    last_maintenance = models.DateField(null=True, blank=True)
    next_maintenance = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.category}"


class ComponentImage(models.Model):
    component = models.ForeignKey(HomeComponent, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='component_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.component.name}"


class ComponentAttachment(models.Model):
    component = models.ForeignKey(HomeComponent, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='component_attachments/')
    name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.component.name}"


class Document(models.Model):
    CATEGORY_CHOICES = [
        ('Property Tax', 'Property Tax'),
        ('Utilities', 'Utilities'),
        ('Insurance', 'Insurance'),
        ('Mortgage', 'Mortgage'),
        ('HOA Documents', 'HOA Documents'),
        ('Permits', 'Permits'),
        ('Inspection Reports', 'Inspection Reports'),
        ('Appraisals', 'Appraisals'),
        ('Title & Deed', 'Title & Deed'),
        ('Warranties', 'Warranties'),
        ('Contracts', 'Contracts'),
        ('Receipts', 'Receipts'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='documents/')
    file_type = models.CharField(max_length=100)
    file_size = models.IntegerField()
    document_date = models.DateField(null=True, blank=True)
    year = models.CharField(max_length=4, blank=True)
    tags = models.JSONField(default=list, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.name} - {self.category}"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    CATEGORY_CHOICES = [
        ('HVAC', 'HVAC'),
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('Landscaping', 'Landscaping'),
        ('Painting', 'Painting'),
        ('Roofing', 'Roofing'),
        ('Flooring', 'Flooring'),
        ('Appliances', 'Appliances'),
        ('General Maintenance', 'General Maintenance'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General Maintenance')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.status}"
