from allauth.headless.account.serializers import UserSerializer as AllauthUserSerializer


class CustomUserSerializer(AllauthUserSerializer):
    """
    Custom user serializer that extends the default allauth headless user serializer
    to include the is_superuser field.
    """
    def to_representation(self, instance):
        """
        Override to_representation to add is_superuser field to the user data.
        """
        data = super().to_representation(instance)
        data['is_superuser'] = instance.is_superuser
        return data
