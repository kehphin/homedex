import dataclasses
from typing import Any, Dict

from allauth.headless.adapter import DefaultHeadlessAdapter


class CustomHeadlessAdapter(DefaultHeadlessAdapter):
    """
    Custom headless adapter that extends the default to include is_superuser field.
    """

    def serialize_user(self, user) -> Dict[str, Any]:
        """
        Override serialize_user to add is_superuser field to the user data.
        """
        data = super().serialize_user(user)
        data['is_superuser'] = user.is_superuser
        return data
