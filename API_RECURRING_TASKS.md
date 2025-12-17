# Recurring Tasks API Documentation

## Task Recurrence Fields

### Model Fields

```python
Task Model:
- is_recurring (boolean): Whether this is a recurring task
- recurrence_pattern (string): 'daily' | 'weekly' | 'monthly' | 'yearly'
- recurrence_interval (integer): Repeat every X periods (default: 1)
- recurrence_days_of_week (JSON array): [0-6] for weekly patterns (0=Sunday)
- recurrence_days_of_month (JSON array): Days or relative patterns for monthly
- recurrence_end_date (date, nullable): When recurrence stops
- parent_task (ForeignKey, nullable): Reference to parent recurring task
```

## API Endpoints

### Create Recurring Task

**POST** `/api/v1/owner/tasks/`

#### Request Body

```json
{
  "title": "Weekly HVAC Maintenance",
  "description": "Check and replace filters",
  "category": "HVAC",
  "priority": "medium",
  "status": "pending",
  "due_date": "2025-12-17",
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [0, 3],
  "recurrence_end_date": "2026-12-17",
  "home_component": "component-uuid-here"
}
```

#### Response (201 Created)

```json
{
  "id": "task-uuid",
  "title": "Weekly HVAC Maintenance",
  "description": "Check and replace filters",
  "category": "HVAC",
  "priority": "medium",
  "status": "pending",
  "due_date": "2025-12-17",
  "created_at": "2025-12-17T10:30:00Z",
  "updated_at": "2025-12-17T10:30:00Z",
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [0, 3],
  "recurrence_days_of_month": [],
  "recurrence_end_date": "2026-12-17",
  "parent_task": null,
  "home_component": "component-uuid-here",
  "home_component_name": "HVAC Unit - Living Room"
}
```

### Update Recurring Task

**PATCH/PUT** `/api/v1/owner/tasks/{id}/`

Same request/response format as Create. Only parent recurring tasks can be updated.

### List Tasks

**GET** `/api/v1/owner/tasks/?is_recurring=true`

Returns all tasks, optionally filtered by `is_recurring=true` to show only recurring tasks.

### Delete Recurring Task

**DELETE** `/api/v1/owner/tasks/{id}/`

Deletes the recurring task definition. Existing instances are NOT automatically deleted.

## Recurrence Pattern Examples

### Daily Pattern

Every 2 days:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "daily",
  "recurrence_interval": 2,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": []
}
```

### Weekly Pattern

Every week on Monday and Wednesday:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [1, 3],
  "recurrence_days_of_month": []
}
```

Every 2 weeks on Friday:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 2,
  "recurrence_days_of_week": [5],
  "recurrence_days_of_month": []
}
```

Day of week mapping:

- 0 = Sunday
- 1 = Monday
- 2 = Tuesday
- 3 = Wednesday
- 4 = Thursday
- 5 = Friday
- 6 = Saturday

### Monthly Pattern - Absolute

On the 1st, 15th, and 28th of each month:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": [1, 15, 28]
}
```

Every 3 months on the 10th:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 3,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": [10]
}
```

### Monthly Pattern - Relative

First Monday of each month:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": [
    {
      "type": "relative",
      "week": "first",
      "day": "Monday"
    }
  ]
}
```

Last Friday of each month:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": [
    {
      "type": "relative",
      "week": "last",
      "day": "Friday"
    }
  ]
}
```

Last day of each month:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "monthly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": [
    {
      "type": "relative",
      "week": "last",
      "day": "day"
    }
  ]
}
```

Week options: `"first"`, `"second"`, `"third"`, `"fourth"`, `"fifth"`, `"last"`

Day options: `"day"` (any day), `"Sunday"`, `"Monday"`, `"Tuesday"`, `"Wednesday"`, `"Thursday"`, `"Friday"`, `"Saturday"`

### Yearly Pattern

Every year:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "yearly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": []
}
```

Every 2 years:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "yearly",
  "recurrence_interval": 2,
  "recurrence_days_of_week": [],
  "recurrence_days_of_month": []
}
```

### With End Date

Any pattern can include an end date:

```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [1, 3, 5],
  "recurrence_end_date": "2026-06-30"
}
```

No end date (runs forever):

```json
{
  "is_recurring": true,
  "recurrence_pattern": "weekly",
  "recurrence_interval": 1,
  "recurrence_days_of_week": [1, 3, 5],
  "recurrence_end_date": null
}
```

## Validation Rules

### Required Fields

- `title`: Non-empty string
- `due_date`: Valid date
- `category`: Must be in CATEGORY_CHOICES
- `priority`: Must be 'low', 'medium', or 'high'

### Recurring Task Validation

- `is_recurring=true` requires `recurrence_pattern`
- `recurrence_pattern='weekly'` requires at least one day in `recurrence_days_of_week`
- `recurrence_pattern='monthly'` requires at least one entry in `recurrence_days_of_month`
- `recurrence_interval` must be >= 1
- `recurrence_end_date` must be >= `due_date` if specified
- `recurrence_days_of_month` must contain valid JSON (days or relative patterns)

### Error Responses

```json
{
  "is_recurring": ["This field is required when creating a recurring task"],
  "recurrence_days_of_week": ["Please select at least one day of the week"],
  "recurrence_pattern": ["This field is required"]
}
```

## Serializer Response Fields

The TaskSerializer returns all fields including the recurrence configuration:

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "category": "string",
  "priority": "string",
  "status": "string",
  "due_date": "date",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_recurring": "boolean",
  "recurrence_pattern": "string | null",
  "recurrence_interval": "integer",
  "recurrence_days_of_week": "array",
  "recurrence_days_of_month": "array",
  "recurrence_end_date": "date | null",
  "parent_task": "uuid | null",
  "home_component": "uuid | null",
  "home_component_name": "string | null"
}
```

## Task Instance Relationships

When a recurring task is used to generate instances:

1. **Parent Task** (is_recurring=true)

   - Definition of the recurrence pattern
   - Not editable for pattern changes after instances created (best practice)
   - Can be deleted (existing instances not affected)

2. **Instance Task** (is_recurring=false)

   - Created automatically at scheduled time
   - `parent_task` field points to parent
   - Can be edited, completed, or deleted independently
   - Not affected by parent pattern changes

3. **RecurringTaskInstance** (tracking model)
   - Links parent and instance
   - Tracks creation relationship
   - Used internally for calculating next instance

## Statistics API

**GET** `/api/v1/owner/statistics/tasks/`

Includes recurring task statistics:

```json
{
  "total": 45,
  "pending": 20,
  "in_progress": 5,
  "completed": 20,
  "recurring": {
    "total_recurring": 8,
    "active_recurring": 6,
    "inactive_recurring": 2
  }
}
```

## Email Notifications

When a new task instance is created from a recurring task:

- Email sent to task owner
- Subject: `New Task: {title}`
- Contains task details and link to dashboard
- Can be disabled per user in settings (future enhancement)

## Rate Limiting

No specific rate limits for recurring task endpoints, but standard API rate limiting applies.

## Batch Operations

Currently not supported. To modify multiple recurring tasks:

1. Iterate through tasks
2. PATCH each individually

Future enhancement: Support batch PATCH/DELETE operations.

## Webhooks

No webhooks for recurring task events currently.

Future enhancement: Webhooks for:

- Recurring task created
- Instance created
- Recurrence completed/ended
