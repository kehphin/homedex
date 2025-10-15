# Homedex

## Frontend Architecture

### Marketing Site & Blog (Astro)

- Built with Astro for optimal performance and SEO
- Key components:
  - Landing page with Hero, Features, Testimonials, and Pricing sections
  - Blog system with MDX support
  - Legal pages (Terms of Service, Privacy Policy)
  - Responsive design with Tailwind CSS and DaisyUI

### Dashboard (React + TypeScript)

- Single Page Application for authenticated users
- Key features:
  - Authentication system
  - Protected routes
  - API integration with Django backend
  - Stripe integration for payments

## Backend (Django)

### Core Features

1. **Authentication System**

   - Session-based authentication
   - Custom user model
   - Registration, login, and logout functionality

2. **Payment Processing**

   - Stripe integration
   - Subscription management
   - Payment history tracking

3. **API Layer**

   - Django REST Framework
   - Secure endpoints
   - Serialization for complex data types

4. **Security**
   - CORS configuration
   - CSRF protection
   - Secure session handling

## Key Technologies

### Frontend

- Astro
- React
- TypeScript
- Tailwind CSS
- DaisyUI
- Stripe.js

### Backend

- Django
- Django REST Framework
- dj-stripe
- PostgreSQL
- Gunicorn
- Whitenoise

## Frontend (React + TypeScript)

The frontend is organized into several key components and services:

1. **Authentication**:

   - `frontend/src/auth/AuthService.ts`: Handles authentication-related API calls.
   - `frontend/src/auth/AuthContext.tsx`: Provides a React context for managing authentication state.
   - `frontend/src/auth/hooks.ts`: Custom hooks for accessing auth-related functionality.
   - `frontend/src/auth/user/Signup.tsx`: Component for user signup.
   - `frontend/src/auth/user/Login.tsx`: Component for user login.

2. **API Communication**:

   - `frontend/src/lib/apiUtils.ts`: Utility functions for making API requests to the backend.

3. **Constants and Types**:

   - `frontend/src/auth/constants.ts`: Stores important constants used throughout the auth system.
   - `frontend/src/auth/types.ts`: Defines TypeScript types and interfaces for auth-related data.

4. **Main Application**:
   - `frontend/src/Dashboard.tsx`: Main component of the application.

## Backend (Django)

The backend is built with Django and includes the following modules:

1. **Authentication Module**:

   - Located in `backend/user_auth/` directory.
   - Handles user registration, login, and session-based authentication.
   - Utilizes Django's built-in authentication system, with custom user model in `backend/user_auth/models.py`.
   - Uses Django's default session-based authentication, configured in `backend/settings.py`.
   - Provides API endpoints for user registration, login, logout in `backend/user_auth/views.py`.
   - URL routing for auth endpoints defined in `backend/user_auth/urls.py`.
   - Custom authentication logic implemented in `backend/user_auth/views.py`.

2. **Payments Module**:

   - Located in `backend/payments/` directory.
   - Manages payment processing and related functionalities.
   - URL routing:
     - `backend/payments/urls.py`: Defines API endpoints for the payments module.
   - Models:
     - `backend/payments/models.py`: Defines models for Payment, Transaction, and UserBalance.
   - Views:
     - `backend/payments/views.py`: Implements API views for:
       - Initiating payments (`initiate_payment`)
       - Checking payment status (`check_payment_status`)
       - Retrieving payment history (`get_payment_history`)
   - Serializers:
     - `backend/payments/serializers.py`: Defines serializers for Payment, Transaction, and UserBalance models.
   - Admin:
     - `backend/payments/admin.py`: Configures admin interface for payment-related models.

3. **API Layer**:

   - Utilizes Django REST Framework for creating RESTful APIs.
   - Implements serializers for converting complex data types to Python datatypes that can then be easily rendered into JSON.
   - Includes viewsets or function-based views for handling API requests and responses.

4. **Database**:

   - Uses Django's ORM (Object-Relational Mapping) for database operations.
   - Likely includes models for User, Payment, Transaction, and possibly Subscription or Product.

5. **Security**:
   - Implements CORS (Cross-Origin Resource Sharing) headers to control which domains can access the API.
   - Uses Django's built-in security features like protection against CSRF (Cross-Site Request Forgery) attacks.

## Integration Between Frontend and Backend

1. **Authentication Flow**:

   - The frontend's `frontend/src/auth/AuthService.ts` handles authentication-related API calls to the backend.
   - `frontend/src/auth/AuthContext.tsx` provides a React context for managing and sharing authentication state across components.
   - `frontend/src/auth/user/Login.tsx` component uses `AuthService` to send login credentials to the backend and update the `AuthContext` with the authenticated user information.
   - `frontend/src/auth/hooks.ts` provides custom hooks like `useAuth()` for components to easily access authentication state and functions.

2. **API Communication**:

   - `frontend/src/lib/apiUtils.ts` contains utility functions for making HTTP requests to the backend, including:
     - A base API client setup
     - Functions to handle request headers, including authentication tokens
     - Error handling and response parsing

3. **Type Safety**:

   - `frontend/src/auth/types.ts` defines TypeScript interfaces and types for auth-related data, ensuring type consistency between frontend components and backend responses.

4. **Constants**:

   - `frontend/src/auth/constants.ts` stores important constants used in the auth system, including API endpoints, token storage keys, and authentication-related enums.

5. **Payment Processing**:

   - The backend's `backend/payments/urls.py` defines API endpoints for payment-related operations.
   - Frontend components use `frontend/src/lib/apiUtils.ts` to make requests to these payment endpoints.
   - The `frontend/src/Dashboard.tsx` component may include or manage components that interact with the payment system.

6. **Protected Routes**:

   - The `AuthContext` from `frontend/src/auth/AuthContext.tsx` and associated hooks are used to protect routes that require authentication, redirecting unauthenticated users to the `frontend/src/auth/user/Login.tsx` component.

7. **Data Flow**:
   - Frontend components use `frontend/src/lib/apiUtils.ts` to make API calls to the backend endpoints.
   - Responses from the backend are typed according to interfaces defined in `frontend/src/auth/types.ts`.
   - The `AuthContext` is updated based on successful authentication or logout operations.
   - Components like `frontend/src/Dashboard.tsx` use the authentication state to determine what content to display and what API calls can be made.

This integration ensures a secure, type-safe, and efficient communication between the React frontend and the Django backend, with a focus on authentication and payment processing functionalities.

## Adding a Full-Stack Feature

This section documents the complete process of adding a new feature from frontend to backend, using the Home Components feature as a reference example.

### Overview

When adding a new full-stack feature to Homedex, you'll need to:

1. Create backend models and API endpoints
2. Create frontend API service
3. Build React components that consume the API
4. Wire everything together with proper authentication

### Backend Implementation

#### 1. Define Django Models

Location: `backend/<app_name>/models.py`

Add models for your feature. For the Home Components example:

```python
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class HomeComponent(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='home_components')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    # ... other fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class ComponentImage(models.Model):
    component = models.ForeignKey(HomeComponent, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='component_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class ComponentAttachment(models.Model):
    component = models.ForeignKey(HomeComponent, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='component_attachments/')
    name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

**Key Points:**

- Always include a `user` ForeignKey for user-specific data
- Use `related_name` for reverse relationships
- Add `auto_now_add` and `auto_now` for timestamps
- Use choices for predefined options
- Consider related models for files/images

#### 2. Create Serializers

Location: `backend/<app_name>/serializers.py`

```python
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

class HomeComponentSerializer(serializers.ModelSerializer):
    images = ComponentImageSerializer(many=True, read_only=True)
    image_files = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = HomeComponent
        fields = ['id', 'name', 'category', ..., 'images', 'image_files']
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        image_files = validated_data.pop('image_files', [])
        component = HomeComponent.objects.create(**validated_data)

        for image_file in image_files:
            ComponentImage.objects.create(component=component, image=image_file)

        return component
```

**Key Points:**

- Create nested serializers for related models
- Use `SerializerMethodField` for computed fields
- Separate read-only and write-only fields
- Handle file uploads in `create()` and `update()` methods
- Use `request.build_absolute_uri()` for full URLs

#### 3. Create ViewSets

Location: `backend/<app_name>/views.py`

```python
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

class HomeComponentViewSet(viewsets.ModelViewSet):
    serializer_class = HomeComponentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own components
        return HomeComponent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user when creating
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['delete'], url_path='images/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """Delete a specific image from a component"""
        component = self.get_object()
        try:
            image = ComponentImage.objects.get(id=image_id, component=component)
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ComponentImage.DoesNotExist:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about user's components"""
        queryset = self.get_queryset()
        return Response({
            'total': queryset.count(),
            # ... other stats
        })
```

**Key Points:**

- Use `ModelViewSet` for full CRUD operations
- Always require authentication with `permission_classes`
- Override `get_queryset()` to filter by user
- Override `perform_create()` to set the user automatically
- Use `@action` decorator for custom endpoints
- Return appropriate HTTP status codes

#### 4. Configure URLs

Location: `backend/<app_name>/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'components', views.HomeComponentViewSet, basename='homecomponent')

urlpatterns = [
    path('', include(router.urls)),
]
```

**Key Points:**

- Use `DefaultRouter` for ViewSets (provides all standard routes)
- Include router URLs in your app's urlpatterns
- Set appropriate basename for reverse URL lookups

#### 5. Register in Admin

Location: `backend/<app_name>/admin.py`

```python
from django.contrib import admin
from .models import HomeComponent, ComponentImage, ComponentAttachment

class ComponentImageInline(admin.TabularInline):
    model = ComponentImage
    extra = 0

@admin.register(HomeComponent)
class HomeComponentAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'user', 'condition', 'created_at']
    list_filter = ['category', 'condition', 'created_at']
    search_fields = ['name', 'brand', 'model', 'sku']
    inlines = [ComponentImageInline]
    readonly_fields = ['created_at', 'updated_at']
```

**Key Points:**

- Use inlines for related models
- Configure list_display, list_filter, and search_fields
- Mark timestamp fields as readonly

#### 6. Create Migrations

```bash
cd backend
python manage.py makemigrations <app_name>
python manage.py migrate
```

### Frontend Implementation

#### 1. Create API Service

Location: `frontend/src/<feature>/Service.ts`

```typescript
import { config } from "../config";

const API_BASE = `${config.appHost}/api/<app_name>`;

interface ComponentData {
  name: string;
  category: string;
  condition: "excellent" | "good" | "fair" | "poor";
  // ... other fields
}

interface HomeComponent extends ComponentData {
  id: string;
  images: Array<{ id: string; url: string }>;
  created_at: string;
  updated_at: string;
}

/**
 * Get CSRF token from cookie
 */
function getCSRFToken(): string | null {
  const name = "csrftoken";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Fetch all components for the authenticated user
 */
export async function getComponents(): Promise<HomeComponent[]> {
  const response = await fetch(`${API_BASE}/components/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch components");
  }

  return await response.json();
}

/**
 * Create a new component with file uploads
 */
export async function createComponent(
  data: ComponentData,
  images?: File[],
  attachments?: File[]
): Promise<HomeComponent> {
  const formData = new FormData();

  // Add component data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value.toString());
    }
  });

  // Add images
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append("image_files", image);
    });
  }

  const response = await fetch(`${API_BASE}/components/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": getCSRFToken() || "",
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create component");
  }

  return await response.json();
}

export type { HomeComponent, ComponentData };
```

**Key Points:**

- Define TypeScript interfaces for type safety
- Always include `credentials: 'include'` for authentication cookies
- Add CSRF token to all POST/PUT/PATCH/DELETE requests
- Use FormData for file uploads
- Handle errors appropriately
- Export types for use in components

#### 2. Create React Component

Location: `frontend/src/<feature>/Component.tsx`

```typescript
import React, { useState, useEffect } from "react";
import * as ComponentsService from "./ComponentsService";

export default function HomeComponents() {
  const [components, setComponents] = useState<HomeComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ComponentsService.getComponents();
      setComponents(data);
    } catch (err) {
      console.error("Failed to load components:", err);
      setError("Failed to load components. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData, images: File[]) => {
    try {
      const created = await ComponentsService.createComponent(formData, images);
      setComponents([created, ...components]);
    } catch (err) {
      console.error("Failed to create:", err);
      alert("Failed to create component. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await ComponentsService.deleteComponent(id);
      setComponents(components.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete component. Please try again.");
    }
  };

  // Render loading state
  if (loading && components.length === 0) {
    return <div className="loading loading-spinner"></div>;
  }

  // Render error state
  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return <div>{/* Component JSX */}</div>;
}
```

**Key Points:**

- Use useState for component state management
- Use useEffect for loading data on mount
- Implement proper loading and error states
- Handle async operations with try/catch
- Update local state after API calls
- Provide user feedback for errors
- Use TypeScript for type safety

#### 3. Handle File Uploads in React

```typescript
const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
const [selectedImagePreviews, setSelectedImagePreviews] = useState<string[]>(
  []
);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files) {
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedImageFiles([...selectedImageFiles, ...newFiles]);
    setSelectedImagePreviews([...selectedImagePreviews, ...newPreviews]);
  }
};

const handleRemoveImage = (index: number) => {
  URL.revokeObjectURL(selectedImagePreviews[index]); // Clean up memory
  setSelectedImageFiles(selectedImageFiles.filter((_, i) => i !== index));
  setSelectedImagePreviews(selectedImagePreviews.filter((_, i) => i !== index));
};

// In JSX:
<input type="file" accept="image/*" multiple onChange={handleImageUpload} />;

{
  selectedImagePreviews.map((preview, index) => (
    <div key={index}>
      <img src={preview} alt={`Preview ${index}`} />
      <button onClick={() => handleRemoveImage(index)}>Remove</button>
    </div>
  ));
}
```

**Key Points:**

- Store File objects and preview URLs separately
- Use `URL.createObjectURL()` for previews
- Remember to `URL.revokeObjectURL()` to prevent memory leaks
- Keep track of both new and existing files when editing

### Testing the Integration

1. **Create migrations and migrate the database:**

   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Start the backend server:**

   ```bash
   python manage.py runserver
   ```

3. **Start the frontend development server:**

   ```bash
   cd frontend
   npm start
   ```

4. **Test the following:**
   - Authentication is required for all endpoints
   - Users can only see their own data
   - CRUD operations work correctly
   - File uploads work properly
   - Error handling works as expected
   - Validation is working on both frontend and backend

### Common Patterns and Best Practices

#### Backend Best Practices

1. **Always filter by user:** Ensure users can only access their own data
2. **Use serializers for validation:** Don't trust client-side validation alone
3. **Return appropriate status codes:** 200, 201, 204, 400, 401, 403, 404, 500
4. **Use transactions for complex operations:** Wrap in `@transaction.atomic`
5. **Add proper permissions:** Use Django REST Framework permission classes
6. **Document your API:** Add docstrings to views and serializers
7. **Handle file cleanup:** Delete old files when updating or deleting records

#### Frontend Best Practices

1. **Type everything:** Use TypeScript interfaces for all data structures
2. **Handle loading states:** Show spinners or skeletons while loading
3. **Handle error states:** Display meaningful error messages to users
4. **Validate before submitting:** Don't rely solely on backend validation
5. **Clean up resources:** Revoke object URLs, cancel pending requests
6. **Provide feedback:** Show success/error messages after operations
7. **Optimize re-renders:** Use React.memo, useMemo, useCallback when needed
8. **Keep state synchronized:** Update local state after successful API calls

#### Security Considerations

1. **Always use HTTPS in production**
2. **Include CSRF tokens in all mutating requests**
3. **Validate and sanitize all inputs on the backend**
4. **Use Django's built-in security features**
5. **Set appropriate CORS policies**
6. **Never expose sensitive data in API responses**
7. **Implement rate limiting for API endpoints**
8. **Use proper authentication and authorization**

### File Structure Summary

```
backend/
└── <app_name>/
    ├── models.py          # Database models
    ├── serializers.py     # DRF serializers
    ├── views.py           # ViewSets and API views
    ├── urls.py            # URL routing
    ├── admin.py           # Admin configuration
    └── migrations/        # Database migrations

frontend/
└── src/
    └── <feature>/
        ├── Service.ts     # API service functions
        ├── Component.tsx  # Main React component
        └── types.ts       # TypeScript interfaces (optional)
```

This pattern ensures consistency across features and makes the codebase maintainable and scalable.
