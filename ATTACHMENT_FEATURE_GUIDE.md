# Document Attachment Feature - Implementation Guide

## Overview
This feature enables users to **attach PDF, photo, and other document files when transferring documents between departments**. Attachments are stored in the database and linked to specific journey steps (transactions) in a document's lifecycle.

## What's Been Added

### 1. Database Schema (New Tables & Columns)
**File:** `backend/journey-attachments-migration.sql`

#### New Table: `journey_attachments`
Stores all file attachments linked to journey steps:
```sql
CREATE TABLE journey_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  journey_id INT NOT NULL,
  record_code VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(120) NOT NULL,
  file_size INT NOT NULL,
  file_data LONGBLOB NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journey_id) REFERENCES journey_logs(id) ON DELETE CASCADE
);
```

#### Updated Table: `journey_logs`
Two new columns added:
- `has_attachments` (BOOLEAN): Flag indicating if this step has attachments
- `description` (TEXT): Extended description/comment for the transaction step

### 2. Backend API Updates
**File:** `backend/app.js`

#### New Dependencies
- **multer**: Added for handling multipart/form-data file uploads
- File size limit: 50MB per request
- Allowed MIME types:
  - PDF: `application/pdf`
  - Images: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
  - Documents: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - Spreadsheets: `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### Updated Endpoint: `POST /api/records/:recordCode/location`
Now accepts multipart/form-data with file attachments:
- **Form fields:**
  - `location` (string): Department/location name
  - `status` (string): Document status
  - `handler` (string): Handler name
  - `comment` (string, optional): Transaction note
  - `attachments` (files, optional): Up to 5 files per upload

- **Response:** Returns `attachmentsStored` count indicating how many files were saved

#### New Endpoints
1. **GET `/api/journey/:journeyId/attachments`**
   - Retrieves list of attachments for a journey step
   - Returns: Array of attachment metadata (id, file_name, file_type, file_size, uploaded_by, uploaded_at)

2. **GET `/api/journey/:journeyId/attachments/:attachmentId/download`**
   - Downloads a specific attachment file
   - Returns: File binary data with appropriate Content-Type and Content-Disposition headers

### 3. Frontend API Helper
**File:** `Frontend/src/api.js`

#### Updated Function: `updateRecordLocation()`
Now accepts optional third parameter for attachments:
```javascript
updateRecordLocation(recordId, payload, attachments = [])
```
- Sends files as `multipart/form-data` when attachments are provided
- Falls back to JSON request when no attachments

#### New Functions:
1. **`fetchJourneyAttachments(journeyId)`**
   - Retrieves metadata for attachments on a journey step

2. **`downloadJourneyAttachment(journeyId, attachmentId, fileName)`**
   - Downloads a single attachment with proper file handling
   - Automatically triggers browser download

### 4. Frontend Scanner Component
**File:** `Frontend/src/pages/Scanner.jsx`

#### New State Variables
- `selectedAttachments`: Array of File objects selected for upload
- `attachmentInputRef`: Ref to hidden file input element

#### New UI Section: "Attach documents"
Located in the update form, before the "Save update" button:
- Multi-file input (up to 5 files)
- Accepts: PDF, images (JPG, PNG, GIF, WebP), Word docs, Excel sheets
- Shows selected files with:
  - File name
  - File size (in MB)
  - Remove button (✕) to clear individual files
- Drag-and-drop ready through standard file input

#### Updated Functions
- `clearRecord()`: Now also clears selected attachments
- `saveLocation()`: Passes selected attachments to API

## How to Use

### For Users (Document Transfer with Attachments)

1. **Load a Document**
   - Enter record code or scan QR code
   - Document details load

2. **Prepare Transfer**
   - Select new department from "Current department" dropdown
   - Select status (transit, pending, approved, etc.)
   - Add optional comment

3. **Attach Documents (New)**
   - Click "📎 Add PDF or photo documents" button
   - Select one or more files (PDF, images, Word, Excel)
   - Files appear in list below button
   - Remove files by clicking ✕ if needed

4. **Save Transfer**
   - Click "Save update" button
   - System uploads documents and updates journey
   - Notification shows if attachments were stored

### For Developers (Integration)

#### Database Setup
1. Run the migration:
```bash
mysql -u your_user -p your_password doctrack < backend/journey-attachments-migration.sql
```

#### Package Installation
```bash
cd backend
npm install
```

#### Using the API with Attachments

**Frontend (React):**
```javascript
import { updateRecordLocation } from "../api";

const files = [/* File objects from input */];
const response = await updateRecordLocation(
  recordCode,
  {
    location: "Finance",
    status: "transit",
    handler: "John Doe",
    comment: "For approval"
  },
  files  // Optional: array of File objects
);

console.log(`${response.attachmentsStored} files stored`);
```

**Retrieving Attachments:**
```javascript
import { fetchJourneyAttachments, downloadJourneyAttachment } from "../api";

// Get list of attachments for a journey step
const { attachments } = await fetchJourneyAttachments(journeyId);

// Download specific attachment
await downloadJourneyAttachment(journeyId, attachmentId, fileName);
```

## File Size Limits
- **Per file:** Limited by browser file input (typically 2GB)
- **Per request:** 50MB total (configured in backend)
- **Database:** LONGBLOB supports up to 4GB per field

## Security Considerations

1. **File Type Validation**
   - Only whitelisted MIME types accepted
   - Extensions not used for validation (MIME-based only)

2. **Authentication**
   - Requires valid admin headers (`x-admin-email`, `x-admin-token`)
   - Applied at API endpoint level

3. **Data Integrity**
   - Files stored as binary blobs with metadata
   - Associated with journey step for audit trail
   - Immutable (deleted only if journey_logs row deleted via CASCADE)

## Troubleshooting

### Files Not Uploading
- Check file MIME type (must be in whitelist)
- Ensure file size < 50MB per request
- Verify admin authentication headers are set
- Check browser console for specific error messages

### Attachments Not Showing in History
- Database migration may not have been applied
- Check `journey_attachments` table exists
- Verify journey_logs has `has_attachments` column

### Large File Upload Fails
- Reduce file size or number of files per upload
- Default limit is 50MB per request (configurable in app.js)
- Split large transfers into multiple uploads if needed

## Future Enhancements

- Preview thumbnails for images
- File type icons in UI
- Drag-and-drop upload zone
- Progress bar for large uploads
- Automatic compression for images
- OCR integration for document indexing
- Attachment versioning/history
- Batch download as ZIP archive
- Virus scan integration

## API Response Examples

### Successful Transfer with Attachments
```json
{
  "record": {
    "id": "DOC-2026-0341",
    "name": "Contract Review",
    "dept": "Finance",
    "status": "transit",
    "handler": "Jane Smith",
    "location": "Finance Department",
    "updated_at": "2026-07-22 14:30:45"
  },
  "attachmentsStored": 2
}
```

### Retrieve Attachments
```json
{
  "attachments": [
    {
      "id": 1,
      "file_name": "contract_draft.pdf",
      "file_type": "application/pdf",
      "file_size": 2048576,
      "uploaded_by": "admin@example.com",
      "uploaded_at": "2026-07-22 14:30:45"
    },
    {
      "id": 2,
      "file_name": "signature_page.jpg",
      "file_type": "image/jpeg",
      "file_size": 1024000,
      "uploaded_by": "admin@example.com",
      "uploaded_at": "2026-07-22 14:30:45"
    }
  ]
}
```

## Files Modified
- `backend/package.json` - Added multer dependency
- `backend/app.js` - Added multer config, updated location endpoint, new attachment endpoints
- `backend/journey-attachments-migration.sql` - New migration file
- `Frontend/src/api.js` - Updated updateRecordLocation, added attachment functions
- `Frontend/src/pages/Scanner.jsx` - Added file upload UI and state management

---
**Last Updated:** 2026-07-22  
**Version:** 1.0 - Initial Release
