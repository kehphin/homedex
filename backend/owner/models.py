from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

# Create your models here.
class Home(models.Model):
    """
    Represents a physical home/property that can have multiple users associated with it.
    This is the central entity that all home-related data (components, documents, etc.) belongs to.
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
        ('mini_split', 'Mini-split'),
        ('stove', 'Stove'),
        ('multiple', 'Multiple'),
    ]

    HEATING_SOURCE_CHOICES = [
        ('natural_gas', 'Natural Gas'),
        ('oil', 'Oil'),
        ('electric', 'Electric'),
        ('multiple', 'Multiple'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255, help_text="Friendly name like 'Main House' or 'Vacation Home'")
    address = models.CharField(max_length=255, unique=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)

    # Home details
    square_feet = models.IntegerField(null=True, blank=True)
    bedrooms = models.IntegerField(null=True, blank=True)
    bathrooms = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    ac = models.BooleanField(default=False)
    ac_type = models.CharField(max_length=50, choices=AC_TYPES, blank=True)
    heat = models.BooleanField(default=True)
    heat_type = models.CharField(max_length=50, choices=HEAT_TYPES, blank=True)
    heating_source = models.CharField(max_length=50, choices=HEATING_SOURCE_CHOICES, blank=True)
    is_septic = models.BooleanField(default=False, verbose_name="Septic System")
    year_built = models.IntegerField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Home"
        verbose_name_plural = "Homes"
        ordering = ['name', 'address']

    def __str__(self):
        return f"{self.name} - {self.address}"


class HomeMembership(models.Model):
    """
    Links users to homes with specific roles.
    A user can be a member of multiple homes.
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('viewer', 'Viewer'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_memberships')
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='owner')
    is_primary = models.BooleanField(default=False, help_text="User's default/primary home")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'home']
        ordering = ['-is_primary', '-joined_at']

    def __str__(self):
        return f"{self.user.email} - {self.home.name} ({self.role})"

    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primaries for this user
        if self.is_primary:
            HomeMembership.objects.filter(user=self.user, is_primary=True).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class UserHomeContext(models.Model):
    """
    Tracks which home a user is currently viewing/working with.
    This allows users to switch between their homes.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='home_context')
    current_home = models.ForeignKey(Home, on_delete=models.SET_NULL, null=True, blank=True, related_name='active_users')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Home Context"
        verbose_name_plural = "User Home Contexts"

    def __str__(self):
        return f"{self.user.email} viewing {self.current_home.name if self.current_home else 'None'}"


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
        ('mini_split', 'Mini-split'),
        ('stove', 'Stove'),
        ('multiple', 'Multiple'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='home_profile')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
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
        ('multiple', 'Multiple'),
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


class HomeLocation(models.Model):
    """
    Represents a location in the user's home where components are installed.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_locations', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='locations', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        # unique_together will be re-enabled after migration
        # unique_together = ['home', 'name']

    def __str__(self):
        return f"{self.name}"


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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_components', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='components', null=True, blank=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    brand = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    sku = models.CharField(max_length=100, blank=True)
    year_installed = models.CharField(max_length=4, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    warranty_expiration = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)  # Legacy: kept for backwards compatibility
    location_fk = models.ForeignKey(HomeLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name='components')
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
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']

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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='documents', null=True, blank=True)
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
        ('dismissed', 'Dismissed'),
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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General Maintenance')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateField()
    home_component = models.ForeignKey(HomeComponent, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')

    # Recurring task fields
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=20, choices=RECURRENCE_CHOICES, null=True, blank=True)
    recurrence_interval = models.IntegerField(default=1, help_text="Repeat every N days/weeks/months/years")
    # For weekly: stores JSON like ["0", "3", "5"] (day indices 0=Sunday)
    recurrence_days_of_week = models.JSONField(default=list, blank=True, help_text="Selected days of week for weekly recurrence")
    # For monthly: stores JSON like [1, 15, 20] (day of month) OR {"type": "relative", "week": "first", "day": "Monday"}
    recurrence_days_of_month = models.JSONField(default=list, blank=True, help_text="Selected days of month or relative day pattern for monthly recurrence")
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


class TaskTemplate(models.Model):
    """
    Template for maintenance tasks that can be matched to HomeComponents.
    When a HomeComponent matches a template, a TaskRegistration is created.
    """
    SEASON_CHOICES = [
        ('all', 'All Seasons'),
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('fall', 'Fall'),
        ('winter', 'Winter'),
    ]

    REGION_CHOICES = [
        ('all', 'All Regions'),
        ('northeast', 'Northeast'),
        ('southeast', 'Southeast'),
        ('midwest', 'Midwest'),
        ('southwest', 'Southwest'),
        ('west', 'West'),
        ('pacific', 'Pacific'),
    ]

    # === MATCHING FIELDS ===
    # Category must match HomeComponent.CATEGORY_CHOICES
    category = models.CharField(max_length=50, choices=HomeComponent.CATEGORY_CHOICES)
    subcategory = models.CharField(max_length=100, blank=True, help_text="More specific type, e.g., 'Furnace', 'Water Heater (Tank)'")
    match_keywords = models.JSONField(default=list, blank=True, help_text="Keywords to match against component name, brand, model")
    match_brands = models.JSONField(default=list, blank=True, help_text="Specific brands this applies to (empty = all brands)")

    # === TASK DETAILS ===
    title = models.CharField(max_length=255)
    description = models.TextField()
    importance = models.TextField(blank=True, help_text="Why this maintenance task matters")

    # === SCHEDULING ===
    frequency_months = models.IntegerField(help_text="How often this task should be performed (in months)")
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='all')
    region = models.CharField(max_length=20, choices=REGION_CHOICES, default='all')

    # === EXECUTION INFO ===
    skill_level = models.IntegerField(
        default=1,
        help_text="Skill level required (1-5, where 1 is easiest)"
    )
    time_estimate_minutes = models.IntegerField(help_text="Estimated time to complete in minutes")
    tools_needed = models.JSONField(default=list, blank=True)
    safety_warning = models.TextField(blank=True)
    contractor_type = models.CharField(max_length=100, blank=True, help_text="Type of contractor if professional help needed")

    # === COST INFO ===
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Estimated cost to perform this task")
    estimated_deferred_cost = models.CharField(max_length=100, blank=True, help_text="Estimated cost if maintenance is deferred, e.g., '$4,000–$12,000'")

    # === VISUAL AIDS ===
    image_cues = models.TextField(blank=True, help_text="Description of visual cues to identify the component/task")
    symptom_tags = models.JSONField(default=list, blank=True, help_text="User-facing troubleshooting keywords")

    # === METADATA ===
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'subcategory', 'title']

    def __str__(self):
        return f"{self.title} ({self.category} - {self.subcategory})"

    def matches_component(self, component):
        """
        Check if this template matches a given HomeComponent.
        Returns True if the component matches the template's criteria.
        """
        # Category must match
        if self.category != component.category:
            return False

        # Check brand matching (if brands specified)
        if self.match_brands:
            component_brand = (component.brand or '').lower()
            if not any(brand.lower() in component_brand for brand in self.match_brands):
                return False

        # Check keyword matching (if keywords specified)
        if self.match_keywords:
            # Build searchable text from component
            searchable = ' '.join([
                component.name or '',
                component.brand or '',
                component.model or '',
                component.notes or '',
            ]).lower()

            # At least one keyword must match
            if not any(keyword.lower() in searchable for keyword in self.match_keywords):
                # Last effort: try to match just the component name against keywords
                component_name = (component.name or '').lower()
                if not any(keyword.lower() in component_name for keyword in self.match_keywords):
                    return False

        return True



class TaskRegistration(models.Model):
    """
    Links a HomeComponent to a TaskTemplate and tracks task generation.
    Created when a HomeComponent matches a TaskTemplate.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_registrations', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='task_registrations', null=True, blank=True)
    home_component = models.ForeignKey(HomeComponent, on_delete=models.CASCADE, related_name='task_registrations')
    task_template = models.ForeignKey(TaskTemplate, on_delete=models.CASCADE, related_name='registrations')

    # Override defaults from template if needed
    frequency_months = models.IntegerField(null=True, blank=True, help_text="Override template frequency (null = use template default)")
    is_active = models.BooleanField(default=True, help_text="Whether tasks should be generated from this registration")

    # Task generation tracking
    last_task_generated = models.DateField(null=True, blank=True)
    next_task_due = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['home_component', 'task_template']

    def __str__(self):
        return f"{self.task_template.title} for {self.home_component.name}"

    def get_frequency_months(self):
        """Returns the effective frequency, using override if set."""
        return self.frequency_months if self.frequency_months is not None else self.task_template.frequency_months


class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contractors', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='contractors', null=True, blank=True)
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
    CATEGORY_CHOICES = [
        ('Regular maintenance', 'Regular maintenance'),
        ('Repair', 'Repair'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='maintenance_histories', null=True, blank=True)
    home = models.ForeignKey(Home, on_delete=models.CASCADE, related_name='maintenance_histories', null=True, blank=True)
    name = models.CharField(max_length=255)
    date = models.DateField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True)
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


class Notification(models.Model):
    """
    Stores in-app notifications for users about upcoming/overdue tasks
    """
    NOTIFICATION_TYPES = [
        ('overdue', 'Overdue Task'),
        ('due_today', 'Due Today'),
        ('due_soon', 'Due Soon (Next 7 Days)'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'task', 'notification_type']

    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.user.email} - {self.task.title}"


class NotificationPreference(models.Model):
    """
    Stores user preferences for notifications
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    # Email preferences
    email_overdue_tasks = models.BooleanField(default=True)
    email_due_soon_tasks = models.BooleanField(default=True)
    email_frequency = models.CharField(
        max_length=20,
        choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('never', 'Never')],
        default='weekly',
        help_text="How often to send email notifications"
    )
    # In-app notification preferences
    inapp_overdue_tasks = models.BooleanField(default=True)
    inapp_due_soon_tasks = models.BooleanField(default=True)
    # Last email sent timestamp
    last_email_sent = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification Preferences for {self.user.email}"
