from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.
class HomeProfile(models.Model):
    """
    Stores the home's general profile information
    """
    AC_TYPES = [
        ('central', 'Central'),
        ('window', 'Window'),
        ('portable', 'Portable'),
        ('split', 'Split'),
        ('none', 'None'),
    ]

    HEAT_TYPES = [
        ('forced_air', 'Forced Air'),
        ('radiant', 'Radiant'),
        ('baseboard', 'Baseboard'),
        ('stove', 'Stove'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='home_profile')
    address = models.CharField(max_length=255)
    square_feet = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    ac = models.BooleanField(default=False)
    ac_type = models.CharField(max_length=50, choices=AC_TYPES, blank=True)
    heat = models.BooleanField(default=True)
    heat_type = models.CharField(max_length=50, choices=HEAT_TYPES, blank=True)

    HEATING_SOURCE_CHOICES = [
        ('natural_gas', 'Natural Gas'),
        ('oil', 'Oil'),
        ('electric', 'Electric'),
        ('other', 'Other'),
    ]
    heating_source = models.CharField(max_length=50, choices=HEATING_SOURCE_CHOICES, blank=True)
    is_septic = models.BooleanField(default=False, verbose_name="Septic System")
    year_built = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Home Profile"
        verbose_name_plural = "Home Profiles"

    def __str__(self):
        return f"Profile for {self.user.email} - {self.address}"


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
        ('Appraisals', 'Appraisals'),
        ('Contracts', 'Contracts'),
        ('HOA Documents', 'HOA Documents'),
        ('Inspection Reports', 'Inspection Reports'),
        ('Insurance', 'Insurance'),
        ('Manuals', 'Manuals'),
        ('Mortgage', 'Mortgage'),
        ('Other', 'Other'),
        ('Permits', 'Permits'),
        ('Property Tax', 'Property Tax'),
        ('Receipts', 'Receipts'),
        ('Title & Deed', 'Title & Deed'),
        ('Utilities', 'Utilities'),
        ('Warranties', 'Warranties'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    home_component = models.ForeignKey(HomeComponent, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
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

    RECURRENCE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General Maintenance')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()

    # Recurring task fields
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, null=True, blank=True)
    recurrence_interval = models.IntegerField(default=1, help_text="Repeat every N days/weeks/months/years")
    recurrence_end_date = models.DateField(null=True, blank=True, help_text="Date when recurring task stops (null = never)")
    parent_task = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='recurring_instances')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.status}"


class RecurringTaskInstance(models.Model):
    """
    Tracks instances of recurring tasks that have been automatically created.
    This helps manage which instances have been created to avoid duplicates.
    """
    recurring_task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='instances', limit_choices_to={'is_recurring': True})
    instance_task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='recurring_parent')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Instance of {self.recurring_task.title} - {self.instance_task.due_date}"


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    service_id = models.CharField(max_length=100)
    service_name = models.CharField(max_length=255)
    service_category = models.CharField(max_length=100)
    service_duration = models.IntegerField()  # in minutes
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-appointment_date', '-appointment_time']

    def __str__(self):
        return f"{self.service_name} - {self.appointment_date} at {self.appointment_time}"


class Contractor(models.Model):
    CATEGORY_CHOICES = [
        ('HVAC', 'HVAC'),
        ('Plumbing', 'Plumbing'),
        ('Electrical', 'Electrical'),
        ('General Maintenance', 'General Maintenance'),
        ('Landscaping', 'Landscaping'),
        ('Roofing', 'Roofing'),
        ('Painting', 'Painting'),
        ('Carpentry', 'Carpentry'),
        ('Flooring', 'Flooring'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contractors')
    name = models.CharField(max_length=255, blank=True)
    company_name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.company_name})" if self.company_name else self.name


class MaintenanceHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_histories')
    name = models.CharField(max_length=255)
    date = models.DateField()
    home_component = models.ForeignKey(HomeComponent, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_histories')
    contractor = models.ForeignKey(Contractor, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_histories')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.date}"


class MaintenanceAttachment(models.Model):
    maintenance = models.ForeignKey(MaintenanceHistory, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='maintenance_attachments/')
    name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.maintenance.name}"
