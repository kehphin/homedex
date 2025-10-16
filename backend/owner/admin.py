from django.contrib import admin
from .models import ContactUs, HomeComponent, ComponentImage, ComponentAttachment, Document, Task, Appointment


class ComponentImageInline(admin.TabularInline):
    model = ComponentImage
    extra = 0


class ComponentAttachmentInline(admin.TabularInline):
    model = ComponentAttachment
    extra = 0


@admin.register(HomeComponent)
class HomeComponentAdmin(admin.ModelAdmin):
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


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
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


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
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


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
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

