from django.contrib import admin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import ContactUs, HomeComponent, ComponentImage, ComponentAttachment, Document, Task, Appointment, Notification, NotificationPreference, TaskTemplate, TaskRegistration


class ComponentImageInline(admin.TabularInline):
    model = ComponentImage
    extra = 0


class ComponentAttachmentInline(admin.TabularInline):
    model = ComponentAttachment
    extra = 0


class HomeComponentResource(resources.ModelResource):
    class Meta:
        model = HomeComponent
        fields = ('id', 'user', 'name', 'category', 'brand', 'model', 'sku', 'location', 'condition', 'year_installed', 'purchase_date', 'purchase_price', 'warranty_expiration', 'notes')


@admin.register(HomeComponent)
class HomeComponentAdmin(ImportExportModelAdmin):
    resource_class = HomeComponentResource
    list_display = ['name', 'category', 'brand', 'model', 'user', 'condition', 'created_at']
    list_filter = ['category', 'condition', 'created_at']
    search_fields = ['name', 'brand', 'model', 'sku', 'location']
    inlines = [ComponentImageInline, ComponentAttachmentInline]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'category', 'brand', 'model', 'sku', 'location', 'condition')
        }),
        ('Purchase & Installation', {
            'fields': ('year_installed', 'purchase_date', 'purchase_price', 'warranty_expiration')
        }),
        ('Maintenance', {
            'fields': ('last_maintenance', 'next_maintenance')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class DocumentResource(resources.ModelResource):
    class Meta:
        model = Document
        fields = ('id', 'user', 'name', 'category', 'description', 'document_date', 'year', 'tags')


@admin.register(Document)
class DocumentAdmin(ImportExportModelAdmin):
    resource_class = DocumentResource
    list_display = ['name', 'category', 'year', 'user', 'uploaded_at']
    list_filter = ['category', 'year', 'uploaded_at']
    search_fields = ['name', 'description', 'category']
    readonly_fields = ['uploaded_at', 'updated_at', 'file_type', 'file_size']

    fieldsets = (
        ('Document Information', {
            'fields': ('user', 'name', 'category', 'description')
        }),
        ('File Information', {
            'fields': ('file', 'file_type', 'file_size')
        }),
        ('Date Information', {
            'fields': ('document_date', 'year')
        }),
        ('Tags', {
            'fields': ('tags',)
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


admin.site.register(ContactUs)


class TaskResource(resources.ModelResource):
    class Meta:
        model = Task
        fields = ('id', 'user', 'title', 'description', 'category', 'priority', 'status', 'due_date')


@admin.register(Task)
class TaskAdmin(ImportExportModelAdmin):
    resource_class = TaskResource
    list_display = ['title', 'category', 'priority', 'status', 'due_date', 'user', 'created_at']
    list_filter = ['category', 'priority', 'status', 'due_date', 'created_at']
    search_fields = ['title', 'description', 'category']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Task Information', {
            'fields': ('user', 'title', 'description', 'category')
        }),
        ('Task Details', {
            'fields': ('priority', 'status', 'due_date')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class AppointmentResource(resources.ModelResource):
    class Meta:
        model = Appointment
        fields = ('id', 'user', 'service_id', 'service_name', 'service_category', 'service_duration', 'appointment_date', 'appointment_time', 'status', 'notes')


@admin.register(Appointment)
class AppointmentAdmin(ImportExportModelAdmin):
    resource_class = AppointmentResource
    list_display = ['service_name', 'user', 'appointment_date', 'appointment_time', 'status', 'created_at']
    list_filter = ['status', 'service_category', 'appointment_date', 'created_at']
    search_fields = ['service_name', 'service_category', 'notes']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Appointment Information', {
            'fields': ('user', 'service_id', 'service_name', 'service_category', 'service_duration')
        }),
        ('Schedule', {
            'fields': ('appointment_date', 'appointment_time', 'status')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class NotificationResource(resources.ModelResource):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'task', 'notification_type', 'title', 'message', 'is_read')


@admin.register(Notification)
class NotificationAdmin(ImportExportModelAdmin):
    resource_class = NotificationResource
    list_display = ['title', 'user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user__email']
    readonly_fields = ['created_at', 'read_at']

    fieldsets = (
        ('Notification Information', {
            'fields': ('user', 'task', 'notification_type', 'title', 'message')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


class NotificationPreferenceResource(resources.ModelResource):
    class Meta:
        model = NotificationPreference
        fields = ('id', 'user', 'email_overdue_tasks', 'email_due_soon_tasks', 'inapp_overdue_tasks', 'inapp_due_soon_tasks', 'email_frequency')


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(ImportExportModelAdmin):
    resource_class = NotificationPreferenceResource
    list_display = ['user', 'email_frequency', 'last_email_sent']
    list_filter = ['email_frequency', 'created_at']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Email Preferences', {
            'fields': ('user', 'email_overdue_tasks', 'email_due_soon_tasks', 'email_frequency', 'last_email_sent')
        }),
        ('In-App Preferences', {
            'fields': ('inapp_overdue_tasks', 'inapp_due_soon_tasks')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class TaskTemplateResource(resources.ModelResource):
    class Meta:
        model = TaskTemplate
        fields = (
            'id', 'category', 'subcategory', 'title', 'description', 'importance',
            'match_keywords', 'match_brands', 'frequency_months', 'season', 'region',
            'skill_level', 'time_estimate_minutes', 'tools_needed', 'safety_warning',
            'contractor_type', 'estimated_cost', 'estimated_deferred_cost',
            'image_cues', 'symptom_tags', 'is_active'
        )


@admin.register(TaskTemplate)
class TaskTemplateAdmin(ImportExportModelAdmin):
    resource_class = TaskTemplateResource
    list_display = ['title', 'category', 'subcategory', 'frequency_months', 'skill_level', 'is_active', 'created_at']
    list_filter = ['category', 'season', 'region', 'skill_level', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'subcategory', 'match_keywords', 'symptom_tags']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Matching Criteria', {
            'fields': ('category', 'subcategory', 'match_keywords', 'match_brands'),
            'description': 'These fields determine which HomeComponents this template matches.'
        }),
        ('Task Details', {
            'fields': ('title', 'description', 'importance')
        }),
        ('Scheduling', {
            'fields': ('frequency_months', 'season', 'region')
        }),
        ('Execution Info', {
            'fields': ('skill_level', 'time_estimate_minutes', 'tools_needed', 'safety_warning', 'contractor_type')
        }),
        ('Cost Info', {
            'fields': ('estimated_cost', 'estimated_deferred_cost')
        }),
        ('Visual Aids & Symptoms', {
            'fields': ('image_cues', 'symptom_tags')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class TaskRegistrationResource(resources.ModelResource):
    class Meta:
        model = TaskRegistration
        fields = (
            'id', 'user', 'home_component', 'task_template',
            'frequency_months', 'is_active', 'last_task_generated', 'next_task_due'
        )


@admin.register(TaskRegistration)
class TaskRegistrationAdmin(ImportExportModelAdmin):
    resource_class = TaskRegistrationResource
    list_display = ['task_template', 'home_component', 'user', 'is_active', 'next_task_due', 'created_at']
    list_filter = ['is_active', 'task_template__category', 'created_at']
    search_fields = ['task_template__title', 'home_component__name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['user', 'home_component', 'task_template']

    fieldsets = (
        ('Registration Info', {
            'fields': ('user', 'home_component', 'task_template')
        }),
        ('Configuration', {
            'fields': ('frequency_months', 'is_active'),
            'description': 'Leave frequency blank to use the template default.'
        }),
        ('Task Generation', {
            'fields': ('last_task_generated', 'next_task_due')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
