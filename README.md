# Subh

Subh is a bilingual **Arabic / English educational platform** for schools, educators, families, and learning communities.

The platform brings together educational books, curriculum resources, workshop booking, book-request workflows, content management, media management, and admin analytics in one system.

## Live Demo

- Frontend: https://subh-center.onrender.com/
- Backend API: https://subh-back.onrender.com/health

> The current deployment is a demo environment and may use sample data.

---

## Features

### Public Experience

- Arabic and English interface
- Responsive educational website
- Book catalog and category browsing
- Book detail pages
- Search and filtering
- Educational resource pages managed through CMS
- Workshop catalog and session details
- Workshop booking flow
- User registration and login

### Book Request System

Subh uses a structured request process instead of a traditional instant checkout flow.

Users can:

- Browse books
- Add books to a request
- Submit quantities and request details
- Review request status
- Receive quotations
- Track offline payment progress
- Follow fulfillment status

Admins can:

- Review requests
- Update request status
- Prepare quotations
- Record offline payments
- Manage fulfillment
- Complete or reject requests

### Workshops

- Workshop categories
- Presenters
- Workshop details
- Multiple workshop sessions
- Online and in-person sessions
- Capacity and remaining-seat tracking
- Booking workflow
- Offline payment confirmation
- Attendance tracking
- Booking status history
- Email notification workflow

### CMS / Page Builder

Subh includes an admin-controlled visual CMS for public pages.

Supported section templates include:

- Hero
- Text
- Image
- Media
- Image + Text
- Text + Image
- Banner
- Summary

Admins can:

- Add sections
- Reorder sections
- Edit bilingual content
- Hide sections
- Archive sections
- Duplicate sections
- Manage section appearance
- Attach media from the Media Library

### Media Library

- Centralized media asset management
- Cloudinary integration
- Reusable media picker
- Archive / restore workflow
- Media selection for:
  - Books
  - Categories
  - CMS sections
  - Barcode images

### Admin Analytics

The analytics dashboard includes:

- Traffic overview
- Visitors and sessions
- Customer activity
- Book request analytics
- Workshop analytics
- Purchase behavior
- Customer segmentation
- Workshop occupancy
- Attendance rates
- Custom date ranges

Analytics is designed to avoid storing unnecessary personal information.

---

## Tech Stack

### Frontend

- React
- Vite
- Material UI
- Axios
- React Router

### Backend

- Node.js
- Express.js
- JWT authentication
- Cookie-based sessions
- Joi validation
- REST API

### Database

- PostgreSQL

### Media

- Cloudinary

### Email

- MailerSend

### Deployment

- Render Static Site
- Render Web Service
- Render PostgreSQL

---

## Project Structure

```text
subh/
│
├── subh-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── subh-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validation/
│   ├── database/
│   │   └── migrations/
│   ├── package.json
│   └── index.js
│
└── README.md
```

---

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Sewar77/subh.git
cd subh
```

### 2. Install frontend dependencies

```bash
cd subh-frontend
npm install
```

### 3. Install backend dependencies

```bash
cd ../subh-backend
npm install
```

---

## Environment Variables

Create local `.env` files and never commit real credentials.

### Frontend

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

### Backend

Example:

```env
NODE_ENV=development

JWT_SECRET=replace_with_a_long_random_secret

FRONTEND_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:5173

DATABASE_URL=your_postgresql_connection_string

COOKIE_SAME_SITE=lax

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

MAILERSEND_API_KEY=your_mailersend_api_key
WORKSHOP_EMAIL_FROM=your_sender_email
WORKSHOP_EMAIL_FROM_NAME=Subh
```

> Use the exact database environment variable expected by your local backend configuration if it differs from `DATABASE_URL`.

---

## Run the Project

### Backend

From `subh-backend`:

```bash
npm install
node index.js
```

### Frontend

From `subh-frontend`:

```bash
npm install
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

The backend normally runs on:

```text
http://localhost:5000
```

---

## Database

Subh uses PostgreSQL.

The project includes database migrations for major features such as:

- User account alignment
- Structured CMS content
- Book requests
- Media library
- Workshops
- Analytics

For a fresh database, apply the approved baseline/schema setup first and then run the required migrations in the correct order.

> Do not run old or destructive SQL files against production data without reviewing them first.

---

## Authentication & Security

Subh includes:

- JWT authentication
- HTTP-only authentication cookies
- Secure cookies in production
- Configurable SameSite cookie policy
- Explicit CORS allowlist
- Mutation-origin protection
- Admin authorization
- Request validation
- Rate limiting
- Safe user serialization
- Restricted admin endpoints
- Upload restrictions
- Production security configuration checks

---

## Roles

### User

A normal user can:

- Browse books and categories
- Register and log in
- Submit book requests
- Track personal requests
- Book workshop sessions
- View personal workshop bookings

### Admin

Admins can manage:

- Users
- Books
- Categories
- Book requests
- Offline payments
- Workshops
- Sessions
- Presenters
- Workshop bookings
- Attendance
- CMS pages and sections
- Media Library
- Analytics

---

## Bilingual Support

Subh is designed for both Arabic and English.

Content can include:

- English titles and descriptions
- Arabic titles and descriptions
- Localized CMS content
- Localized book and category information
- RTL-friendly Arabic presentation

---

## Demo Data

The development/demo database may include sample:

- Categories
- Books
- Authors
- CMS content
- Workshop data

Demo content is intended only for development, testing, presentations, and client previews.

---

## Deployment Notes

The current demo uses Render:

```text
Frontend  -> Render Static Site
Backend   -> Render Web Service
Database  -> Render PostgreSQL
Media     -> Cloudinary
Email     -> MailerSend
```

Production deployments should use:

- Strong unique secrets
- Production PostgreSQL credentials
- Correct frontend origin allowlists
- HTTPS
- `Secure` authentication cookies
- Environment-specific Cloudinary and email credentials

Never commit `.env` files or private credentials to GitHub.

---

## Future Improvements

Possible future improvements include:

- Automated tests and broader integration coverage
- CI/CD validation
- Improved reporting
- Additional workshop notification channels
- Extended customer communication tools
- Production payment gateway integration
- More advanced CMS components
- More advanced search and recommendations

---

## License

This project is proprietary unless a separate license is added to the repository.

All rights reserved.

---

## Author

Developed by **Sewar**

GitHub: [Sewar77](https://github.com/Sewar77)
