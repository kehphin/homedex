from rest_framework import serializers
from .models import HomeComponent, ComponentImage, ComponentAttachment


class ComponentImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ComponentImage
        fields = ['id', 'url', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ComponentAttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = ComponentAttachment
        fields = ['id', 'name', 'file_type', 'file_size', 'url', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class HomeComponentSerializer(serializers.ModelSerializer):
    images = ComponentImageSerializer(many=True, read_only=True)
    attachments = ComponentAttachmentSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    attachment_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = HomeComponent
        fields = [
            'id', 'name', 'category', 'brand', 'model', 'sku',
            'year_installed', 'purchase_date', 'purchase_price',
            'warranty_expiration', 'location', 'condition', 'notes',
            'last_maintenance', 'next_maintenance', 'created_at',
            'updated_at', 'images', 'attachments', 'image_files',
            'attachment_files'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        attachment_files = validated_data.pop('attachment_files', [])

        component = HomeComponent.objects.create(**validated_data)

        # Create images
        for image_file in image_files:
            ComponentImage.objects.create(component=component, image=image_file)

        # Create attachments
        for attachment_file in attachment_files:
            ComponentAttachment.objects.create(
                component=component,
                file=attachment_file,
                name=attachment_file.name,
                file_type=getattr(attachment_file, 'content_type', ''),
                file_size=attachment_file.size
            )

        return component

    def update(self, instance, validated_data):
        image_files = validated_data.pop('image_files', [])
        attachment_files = validated_data.pop('attachment_files', [])

        # Update component fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Add new images (don't delete old ones unless explicitly requested)
        for image_file in image_files:
            ComponentImage.objects.create(component=instance, image=image_file)

        # Add new attachments
        for attachment_file in attachment_files:
            ComponentAttachment.objects.create(
                component=instance,
                file=attachment_file,
                name=attachment_file.name,
                file_type=getattr(attachment_file, 'content_type', ''),
                file_size=attachment_file.size
            )

        return instance
