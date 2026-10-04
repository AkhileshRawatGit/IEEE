# SRHU IEEE Student Registration & Membership Tracking Portal

A production-quality university web portal engineered for the **IEEE Student Branch — Swami Rama Himalayan University (SRHU)**, Himalayan School of Science and Technology (HSST), Dehradun.

Designed following institutional, clean, and trustworthy design standards — deliberately avoiding generic "AI startup" or dark-mode neon gimmicks in favor of a credible, accessible academic system.

---

## Key Highlights & Features

### 1. Student Portal (`/` and `/student/register`)
- **Institutional Landing Page**:
  - Official IEEE SRHU branch identity (Branch Code: `STB60226050`, Region 10, UP Section).
  - Clear institutional description, 3-step registration overview, and university contact details.
- **Student Registration & Verification Form**:
  - Captures Full Name, DD Number (SRHU Enrollment ID), Course, Year, and Section.
  - Real-time client-side validation with helpful field messages.
- **Server-Safe Verification Logic**:
  - **DD Number Matching**: Matches primary identifier case-insensitively with normalization (e.g. `23cse101` $\rightarrow$ `23CSE101`).
  - **Multi-attribute Verification**: Verifies academic credentials (name, course, year, section) against the official university roster.
  - **3 Distinct States**:
    1. **Student Record Verified**: Displays verified details card with `[Continue Registration]`, updating database status to `joined` with an enrollment receipt.
    2. **Already Registered**: Informs student that their record is already marked as joined with branch administrator contact info.
    3. **Student Record Not Found**: Secure generic feedback to prevent student enumeration while prompting re-check of university ID card.

### 2. Admin Portal (`/admin`)
- **Secure Authentication (`/admin/login`)**:
  - Integrated with **Supabase Auth** with local fallback for evaluation.
  - Quick-Fill Demo credentials: `admin@srhu.edu.in` / `ieeesrhu2026`.
- **Administrative Dashboard (`/admin/dashboard`)**:
  - Clean statistics: Total Students, Joined, Not Joined, Registration Rate (%).
  - Academic degree breakdown table (B.Tech, BCA, MCA) and live progress meters.
  - Recent student registration audit log.
- **Student Directory Table (`/admin/students`)**:
  - Columns: Name, DD No., Course, Year, Section, Status (🟢 JOINED / ⚪ NOT JOINED), Joined At, Actions.
  - Real-time search across Name and DD Number.
  - Multi-filtering by Course, Academic Year, Section, and Status.
  - Multi-column sorting and pagination controls (10 / 25 / 50 per page).
  - Actions: Edit student details, toggle join status manually, delete record with confirmation modal, and add new student records.
  - **CSV Export**: Export all records, joined-only, or not-joined-only in CSV format.
- **OCR Student List Upload Pipeline (`/admin/upload`)**:
  - Supports **JPG, JPEG, PNG, PDF, and CSV/Text** documents.
  - Uses **Tesseract OCR** with structured row parser (`Name | DD No. | Course | Year | Section`).
  - **Strict Admin Review Workflow**: Extracted records are **never** blindly written to the database. They populate an **interactive, editable preview table** where admins can correct OCR errors.
  - **Duplicate Detection**: Existing DD numbers are identified and flagged as `Duplicate (Update)` vs `New Record`.
  - Built-in **Quick Demo Presets** for testing OCR extraction without needing physical paper scans.
- **Portal Settings (`/admin/settings`)**:
  - Live Supabase connection status check.
  - Branch administrative details and one-click seed data reset for test runs.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Tailwind 4 with custom institutional CSS tokens)
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth (with automatic local fallback)
- **Document OCR**: Tesseract.js client & server-safe parser
- **Icons**: Lucide React

---

## Directory Structure

```text
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Public institutional landing page
│   │   ├── layout.tsx                # Root layout with SEO and metadata
│   │   ├── globals.css               # Design system & institutional palette
│   │   ├── student/
│   │   │   ├── page.tsx              # Redirects to /student/register
│   │   │   └── register/page.tsx     # Student registration page
│   │   └── admin/
│   │       ├── page.tsx              # Admin redirect to /admin/dashboard
│   │       ├── login/page.tsx        # Admin login page
│   │       ├── dashboard/page.tsx    # Statistical dashboard & overview
│   │       ├── students/page.tsx     # Student status data table & management
│   │       ├── upload/page.tsx       # OCR upload, editable preview & import
│   │       └── settings/page.tsx     # System settings & Supabase status
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx            # Institutional header with IEEE SRHU branding
│   │   │   └── Footer.tsx            # Institutional footer & campus contact
│   │   ├── student/
│   │   │   └── RegistrationForm.tsx  # Multi-state verification form
│   │   └── admin/
│   │       └── AdminLayout.tsx       # Admin sidebar & authenticated layout
│   ├── lib/
│   │   ├── auth/adminAuth.ts         # Supabase & demo admin authentication
│   │   ├── data/
│   │   │   ├── studentStore.ts       # Unified store (Supabase + local fallback)
│   │   │   └── seedStudents.ts       # Baseline SRHU student records
│   │   ├── supabase/client.ts        # Supabase client initializer
│   │   └── utils/normalization.ts    # DD number & string normalizers
│   └── types/index.ts                # Domain types & interfaces
├── supabase/
│   └── schema.sql                    # PostgreSQL schema, RLS policies, & seeds
└── .env.example                      # Environment variables template
```

---

## Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Evaluation & Demo Credentials

The portal is equipped to run seamlessly out of the box with zero external setup required:

- **Student Portal**: [http://localhost:3000/student/register](http://localhost:3000/student/register)
  - Eligible Student test: Click **"Fill Eligible: Aman Singh (23CSE102)"** $\rightarrow$ Click **Verify & Continue**.
  - Already Registered test: Click **"Fill Joined: Rahul Kumar (23CSE101)"** $\rightarrow$ Click **Verify & Continue**.
- **Admin Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - Email: `admin@srhu.edu.in`
  - Password: `ieeesrhu2026`
  - Or click the **Auto-Fill** button on the login card.

---

## Connecting Supabase (Production Deployment)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in Supabase and run the script in [supabase/schema.sql](file:///c:/Users/akhil/Desktop/ieee/supabase/schema.sql).
3. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Restart the server (`npm run dev`). The portal automatically recognizes the Supabase connection and activates direct cloud PostgreSQL synchronization with Row Level Security.
