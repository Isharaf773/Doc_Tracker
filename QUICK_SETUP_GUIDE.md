# 🚀 Quick Setup Guide - Document Attachment Feature

## Summary
Your **DocTracker** application now supports **uploading PDF and photo documents when transferring documents between departments**.

Users can now attach files (PDF, images, Word docs, etc.) to each transaction step in a document's journey through your organization.

---

## Step 1: Apply Database Migration

Run this command to add the new attachment tables:

```bash
cd backend
mysql -u your_username -p your_password doctrack < journey-attachments-migration.sql
```

**What it does:**
- Creates `journey_attachments` table for storing files
- Adds `has_attachments` flag to `journey_logs`
- Adds `description` column to `journey_logs`

---

## Step 2: Install Backend Dependencies

Install multer for file upload handling:

```bash
cd backend
npm install
```

---

## Step 3: Restart Your Backend Server

```bash
npm start
# or for development:
npm run dev
```

---

## Step 4: Test the Feature

### In the Application:

1. **Open Scanner page** (Document lookup & update)
2. **Load a document** by entering code or scanning QR
3. **Scroll to "Attach documents" section** (NEW!)
4. **Click "📎 Add PDF or photo documents"**
5. **Select one or more files:**
   - ✅ PDFs
   - ✅ Images (JPG, PNG, GIF, WebP)
   - ✅ Word documents (.doc, .docx)
   - ✅ Excel spreadsheets (.xls, .xlsx)
6. **See files listed below** with remove button (✕) if needed
7. **Click "Save update"** to save with attachments
8. **Success!** Documents are now linked to this transfer step

---

## What Changed?

### 📁 New Files Created:
- `backend/journey-attachments-migration.sql` - Database schema updates
- `ATTACHMENT_FEATURE_GUIDE.md` - Complete technical documentation
- `QUICK_SETUP_GUIDE.md` - This file!

### 📝 Files Modified:
- `backend/package.json` - Added multer dependency
- `backend/app.js` - Upload handling, new API endpoints
- `Frontend/src/api.js` - File upload functions
- `Frontend/src/pages/Scanner.jsx` - File upload UI

### 🔄 No Breaking Changes:
- Existing functionality remains unchanged
- Files are optional (attachments not required)
- Backward compatible with existing transfers

---

## Features

### For Users:
✅ Attach up to 5 files per transfer  
✅ Support for PDF, images, and documents  
✅ See file sizes before upload  
✅ Remove individual files from selection  
✅ Automatic progress during save  

### For System:
✅ Files stored securely in database  
✅ Linked to journey step for audit trail  
✅ Download endpoint for retrieval  
✅ Admin authentication required  
✅ Automatic deletion with journey logs  

---

## API Endpoints (For Developers)

### Upload with Attachments:
```
POST /api/records/:recordCode/location
Content-Type: multipart/form-data

Fields:
- location (string)
- status (string)
- handler (string)
- comment (string, optional)
- attachments (files, max 5)
```

### Retrieve Attachments:
```
GET /api/journey/:journeyId/attachments
```

### Download Attachment:
```
GET /api/journey/:journeyId/attachments/:attachmentId/download
```

---

## Limits & Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Files per upload | 5 | Configurable in app.js |
| Size per request | 50MB | Configurable in multer config |
| Allowed types | PDF, images, Office docs | Whitelist in app.js |

---

## Troubleshooting

**Q: Files not uploading?**  
A: Check browser console for error. Ensure file type is supported (see list above).

**Q: Database migration fails?**  
A: Verify MySQL user has CREATE TABLE permissions and doctrack database exists.

**Q: "Unable to update location" error?**  
A: Clear browser cache and verify backend is running.

**Q: Old transfers don't show attachments?**  
A: That's normal - only new transfers include attachments.

---

## Next Steps

1. ✅ Run database migration
2. ✅ Run `npm install` in backend
3. ✅ Restart backend server
4. ✅ Reload frontend application
5. ✅ Test by attaching a PDF to a document transfer
6. ✅ Read `ATTACHMENT_FEATURE_GUIDE.md` for detailed docs

---

## Questions or Issues?

Refer to `ATTACHMENT_FEATURE_GUIDE.md` for:
- Complete API documentation
- Database schema details
- Security considerations
- Future enhancement ideas

---

**Version:** 1.0  
**Last Updated:** 2026-07-22  
**Status:** ✅ Ready to Deploy
