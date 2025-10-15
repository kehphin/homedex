from django.contrib import admin
from .models import ContactUs, HomeComponent, ComponentImage, ComponentAttachment


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


admin.site.register(ContactUs)
