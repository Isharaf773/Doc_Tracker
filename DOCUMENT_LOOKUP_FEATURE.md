# Document Lookup & Download Feature

## Overview
A new **Document Lookup & Download** page has been added to the GeoMine DocTracker application, providing users with an enhanced interface to search, filter, and download documents.

## Features Implemented

### 1. **Multi-Criteria Search**
- Search by ID code or document name
- Flexible search type selection (search all fields, ID only, or name only)
- Real-time validation and error handling

### 2. **Advanced Filtering**
- **Department/Category Filter**: Filter by any department or category
  - All departments
  - Geology, Mining, HR, Finance, Legal, Audit, IT, Media, Procurement, Compliance, Administration
  - Board of Management, Senior Management
- **Status Filter**: Filter by document status
  - All status, Active, Transit, Pending, Completed, Archived

### 3. **Results Display**
- Clean, sortable table interface showing:
  - Document ID Code
  - Document Name
  - Department
  - Status (with color-coded badges)
  - Soft Copy availability indicator
  - Download button

### 4. **Document Details Panel**
- Click on any result to view full document details
- Shows ID, status, document name, department, handler, and last update time
- Direct download button for documents with soft copies

### 5. **Soft Copy Download**
- Download soft copy files directly from the interface
- File names preserved (original filename maintained)
- Admin authorization required for downloads
- Error handling for documents without soft copies

## How to Access

1. **In the Sidebar**: Click on **"Document Lookup"** in the Main section (between QR Scanner and Journey log)
2. **Via URL**: Navigate to `/lookup` (or `#/lookup` in Electron app)

## How to Use

### Basic Search
1. Enter a search term in the **Search term** field (ID code or document name)
2. Click **Search** button
3. Results will appear in the table below

### Advanced Search with Filters
1. Enter a search term (optional)
2. Select a **Department/Category** from the dropdown
3. Select a **Status** from the dropdown
4. Click **Search**
5. Results filtered by all criteria will appear

### View Document Details
1. Click on any row in the results table
2. The **Document Details** panel opens below showing:
   - Full document metadata
   - Download option (if soft copy exists)

### Download a Document
1. Click the **Download** button in the results table, OR
2. Select a document and click the **📥 Download** button in the details panel
3. File will be downloaded with the original filename

## Technical Implementation

### Files Modified
- **Frontend/src/pages/DocumentLookup.jsx** - New lookup page component
- **Frontend/src/pages/index.jsx** - Export new page
- **Frontend/src/App.jsx** - Added route and page configuration
- **Frontend/src/theme.js** - Added navigation menu item

### API Endpoints Used
- `GET /api/records` - Search and filter documents (with query parameters)
- `GET /api/records/:recordCode/soft-copy` - Download soft copy (admin authorization required)

### Query Parameters Supported
```
/api/records?search=term&dept=Department&status=active
```

### Authentication
- Uses the existing admin authorization headers from authenticated user session
- Users must be logged in to access and download documents
- Admin headers (`x-admin-email`, `x-admin-token`) sent automatically with each request

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "No documents found" | Search criteria yielded no results | Adjust search term, department, or status filters |
| "Please enter a search term..." | Empty search with no filters | Enter a search term or select filters |
| "Admin authorization required" | User not logged in | Log in with valid credentials |
| "Unable to download file..." | No soft copy attached | Document doesn't have a soft copy file |

## Integration Notes

- The feature integrates seamlessly with existing authentication
- Uses the same API endpoints as the Documents page
- Matches the application's color scheme and design system
- Responsive layout adapts to different screen sizes
- Clear visual feedback for all user actions

## Future Enhancements (Optional)

1. Export search results to CSV/Excel
2. Bulk download multiple documents
3. Advanced search syntax support
4. Saved search filters
5. Search history
6. Document preview (for PDFs)
7. Sorting by columns
8. Pagination for large result sets
