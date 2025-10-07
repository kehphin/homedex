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
