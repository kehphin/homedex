# Home Components Feature

## Overview

The Home Components page allows users to maintain a comprehensive inventory of all their home's components, appliances, and systems. This helps homeowners track warranties, maintenance schedules, and important details about their home infrastructure.

## Features

### 1. Component Management

- **Add Components**: Create detailed records for any home component
- **Edit Components**: Update information as needed
- **Delete Components**: Remove outdated or sold components
- **View Modes**: Switch between grid and list views for different use cases

### 2. Component Details

Each component can include:

- **Basic Information**:

  - Name (e.g., "Central Air Conditioner")
  - Category (HVAC, Appliances, Roofing, etc.)
  - Location (e.g., "Backyard", "Kitchen")
  - Brand and Model
  - SKU/Serial Number
  - Condition (Excellent, Good, Fair, Poor)

- **Purchase & Installation**:

  - Year Installed
  - Purchase Date
  - Purchase Price
  - Warranty Expiration Date

- **Maintenance Schedule**:

  - Last Maintenance Date
  - Next Maintenance Date

- **Documentation**:
  - Multiple images/photos
  - File attachments (manuals, warranties, receipts)
  - Notes field for additional details

### 3. Search & Filtering

- **Search**: Find components by name, brand, model, category, or location
- **Filter by Category**: View specific types (HVAC, Appliances, Roofing, etc.)
- **Filter by Condition**: Focus on components needing attention
- **Clear Filters**: Quick reset to view all components

### 4. Dashboard Statistics

- **Total Components**: Count of all home components tracked
- **Needs Maintenance**: Components with maintenance due
- **Under Warranty**: Components still covered by warranty

### 5. Visual Organization

- **Grid View**: Card-based layout with thumbnails, ideal for browsing
- **List View**: Detailed table-like view for quick scanning
- **Image Support**: Add multiple photos for each component
- **Condition Badges**: Visual indicators of component condition
- **Attachment Counter**: See at a glance which components have documents

## Categories Supported

The system includes pre-defined categories:

- Appliances
- HVAC
- Plumbing
- Electrical
- Roofing
- Windows & Doors
- Flooring
- Gutters
- Water Heater
- Security System
- Garage Door
- Sump Pump
- Other

## Use Cases

### For Homeowners

- Track all major home investments in one place
- Never lose warranty information again
- Schedule and track maintenance proactively
- Keep photos and manuals accessible
- Document improvements for future home sale

### For Home Maintenance

- Know when components were installed
- Track maintenance history
- Set reminders for upcoming service
- Reference model numbers when ordering parts
- Share information with contractors easily

### For Home Value

- Document home improvements
- Track investment in home infrastructure
- Provide detailed records to potential buyers
- Support insurance claims with documentation

## Sample Data

The page includes sample components to demonstrate functionality:

1. **Central Air Conditioner** (HVAC)

   - Carrier 24ACC6 unit
   - Installed 2020, 10-year warranty
   - Located in backyard

2. **Kitchen Refrigerator** (Appliances)

   - Samsung French door model
   - Installed 2021
   - Located in kitchen

3. **Asphalt Shingle Roof** (Roofing)
   - GAF Timberline HDZ
   - Installed 2018, 30-year warranty
   - Covers entire house

## Technical Implementation

### Component Structure

```typescript
interface HomeComponent {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  sku: string;
  yearInstalled: string;
  purchaseDate: string;
  purchasePrice: string;
  warrantyExpiration: string;
  location: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes: string;
  images: string[];
  attachments: Attachment[];
  lastMaintenance: string;
  nextMaintenance: string;
  createdAt: string;
}
```

### File Upload Support

- **Images**: Accepts common image formats (JPG, PNG, etc.)
- **Attachments**: Accepts any file type (PDF, DOC, etc.)
- **Multiple Files**: Upload multiple images and documents per component

### UI Components Used

- DaisyUI for styling (cards, buttons, badges, modals)
- Heroicons for consistent iconography
- Responsive grid layouts
- Modal forms for add/edit operations

## Future Enhancements (API Integration)

When connected to a backend API, the following features will be enabled:

1. **Persistent Storage**: Save components to database
2. **Cloud File Storage**: Store images and attachments on cloud storage
3. **Maintenance Reminders**: Email/push notifications for upcoming maintenance
4. **Warranty Alerts**: Notifications before warranties expire
5. **Export Functionality**: Generate PDF reports of all components
6. **Sharing**: Share component details with contractors or family
7. **OCR for Receipts**: Auto-extract info from receipt photos
8. **Integration with Tasks**: Link maintenance tasks to components
9. **Cost Tracking**: Calculate total investment and depreciation
10. **Home Value Impact**: Track how improvements affect home value

## Best Practices

### Adding Components

1. Include as much detail as possible
2. Upload multiple angles of the component
3. Attach the original purchase receipt
4. Upload the user manual or installation guide
5. Set maintenance reminders when adding

### Maintenance Tracking

1. Update last maintenance date after service
2. Set next maintenance based on manufacturer recommendations
3. Add notes about what was done during maintenance
4. Keep service receipts as attachments

### Organization Tips

1. Use consistent naming conventions
2. Keep location descriptions specific but concise
3. Update condition regularly (annual review)
4. Take new photos if component appearance changes
5. Document any repairs or replacements

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode compatible
- Responsive design for mobile/tablet/desktop
- Touch-friendly buttons and controls
