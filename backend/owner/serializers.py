from rest_framework import serializers
from .models import HomeProfile, HomeComponent, ComponentImage, ComponentAttachment, Document, Task, RecurringTaskInstance, Appointment, MaintenanceHistory, MaintenanceAttachment, Contractor


class HomeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeProfile
        fields = [
            'id', 'address', 'square_feet', 'bedrooms', 'bathrooms',
            'ac', 'ac_type', 'heat', 'heat_type', 'year_built',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


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
    documents = serializers.SerializerMethodField()
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
            'updated_at', 'images', 'attachments', 'documents', 'image_files',
            'attachment_files'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_documents(self, obj):
        """Get documents associated with this component"""
        documents = obj.documents.all()
        return DocumentDetailSerializer(documents, many=True, context=self.context).data

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


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'category', 'priority',
            'status', 'due_date', 'is_recurring', 'recurrence_pattern',
            'recurrence_interval', 'recurrence_end_date', 'parent_task',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'parent_task']


class DocumentDetailSerializer(serializers.ModelSerializer):
    """Simplified document serializer for nested display in components"""
    file_url = serializers.SerializerMethodField()
    upload_date = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id', 'name', 'category', 'file_type', 'file_size',
            'file_url', 'document_date', 'upload_date'
        ]
        read_only_fields = ['file_type', 'file_size', 'id']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_upload_date(self, obj):
        return obj.uploaded_at.strftime('%Y-%m-%d') if obj.uploaded_at else None


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    upload_date = serializers.SerializerMethodField()
    component_name = serializers.CharField(source='home_component.name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'name', 'category', 'description', 'file_type',
            'file_size', 'document_date', 'year', 'tags', 'uploaded_at',
            'updated_at', 'file_url', 'upload_date', 'home_component', 'component_name'
        ]
        read_only_fields = ['uploaded_at', 'updated_at', 'file_type', 'file_size', 'component_name']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_upload_date(self, obj):
        return obj.uploaded_at.strftime('%Y-%m-%d') if obj.uploaded_at else None

    def create(self, validated_data):
        # Extract file from request
        request = self.context.get('request')
        file = request.FILES.get('file')

        if file:
            validated_data['file'] = file
            validated_data['file_type'] = file.content_type
            validated_data['file_size'] = file.size

        return Document.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Extract file from request if present
        request = self.context.get('request')
        file = request.FILES.get('file')

        if file:
            validated_data['file'] = file
            validated_data['file_type'] = file.content_type
            validated_data['file_size'] = file.size

        # Update document fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            'id', 'service_id', 'service_name', 'service_category',
            'service_duration', 'appointment_date', 'appointment_time',
            'notes', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MaintenanceAttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MaintenanceAttachment
        fields = ['id', 'name', 'file_type', 'file_size', 'url', 'uploaded_at']

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class MaintenanceHistorySerializer(serializers.ModelSerializer):
    attachments = MaintenanceAttachmentSerializer(many=True, read_only=True)
    attachment_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    component_name = serializers.CharField(source='home_component.name', read_only=True)
    contractor_name = serializers.CharField(source='contractor.name', read_only=True)

    class Meta:
        model = MaintenanceHistory
        fields = [
            'id', 'name', 'date', 'home_component', 'component_name', 'contractor',
            'contractor_name', 'price', 'notes', 'created_at', 'updated_at',
            'attachments', 'attachment_files'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        attachment_files = validated_data.pop('attachment_files', [])
        maintenance = MaintenanceHistory.objects.create(**validated_data)

        # Create attachments
        for attachment_file in attachment_files:
            MaintenanceAttachment.objects.create(
                maintenance=maintenance,
                file=attachment_file,
                name=attachment_file.name,
                file_type=getattr(attachment_file, 'content_type', ''),
                file_size=attachment_file.size
            )

        return maintenance

    def update(self, instance, validated_data):
        attachment_files = validated_data.pop('attachment_files', [])

        # Update maintenance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Add new attachments
        for attachment_file in attachment_files:
            MaintenanceAttachment.objects.create(
                maintenance=instance,
                file=attachment_file,
                name=attachment_file.name,
                file_type=getattr(attachment_file, 'content_type', ''),
                file_size=attachment_file.size
            )

        return instance


class ContractorSerializer(serializers.ModelSerializer):
    maintenance_count = serializers.SerializerMethodField()
    total_spent = serializers.SerializerMethodField()

    class Meta:
        model = Contractor
        fields = [
            'id', 'name', 'company_name', 'email', 'website', 'phone',
            'notes', 'created_at', 'updated_at', 'maintenance_count', 'total_spent'
        ]
        read_only_fields = ['created_at', 'updated_at', 'maintenance_count', 'total_spent']

    def get_maintenance_count(self, obj):
        return obj.maintenance_histories.count()

    def get_total_spent(self, obj):
        total = sum(item.price for item in obj.maintenance_histories.all())
        return float(total)


class ContractorDetailSerializer(ContractorSerializer):
    maintenance_histories = serializers.SerializerMethodField()

    class Meta(ContractorSerializer.Meta):
        fields = ContractorSerializer.Meta.fields + ['maintenance_histories']

    def get_maintenance_histories(self, obj):
        # Return maintenance records without full detail to avoid circular references
        records = obj.maintenance_histories.all()
        return [
            {
                'id': record.id,
                'name': record.name,
                'date': record.date,
                'price': float(record.price),
                'component_name': record.home_component.name if record.home_component else 'No component',
            }
            for record in records
        ]
