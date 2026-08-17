# Training Support Hub

Build a complete production-ready web app called:

AADHAAR TRAINING

Grievance & Support Portal

IMPORTANT BRANDING:

Do NOT use “Government of Telangana”, “Telangana Government”, government logos, official emblems, or wording that suggests official government ownership.

Use only neutral professional branding.

USER ROLES:

• 1 Admin with secure login

• Exactly 5 Trainers with separate logins

• Operators need NO login

================================================

QR + PUBLIC OPERATOR PORTAL

================================================

Create ONE common reusable QR code.

When an operator scans the QR, it must open:

/operator

The operator must see ONLY two options:

[ SUBMIT GRIEVANCE ]

[ TRACK GRIEVANCE ]

Submit Grievance → /grievance

Track Grievance → /track

Do NOT show:

• Admin Login

• Trainer Login

• Admin Dashboard

• Trainer Dashboard

Operators must not need an account.

The QR must NOT point to localhost, preview URL, admin or trainer pages.

Admin QR page must allow:

• View QR

• Download QR

• Print QR

• A4 printable QR poster

================================================

OPERATOR GRIEVANCE FORM

================================================

Create a clean, mobile-first form.

Required fields:

• Operator Name *

• Operator ID *

• Mobile Number *

• Enrolment Centre / Agency *

• Telangana District *

• Training Location *

• Trainer Name *

• Training Date *

• Grievance Category *

• Subject *

• Description *

• Priority: Low / Medium / High / Critical

• Optional Attachment

Use a step-based form:

Step 1 — Operator Details

Step 2 — Training Details

Step 3 — Grievance Details

Step 4 — Review & Submit

Show a progress indicator.

================================================

TELANGANA DISTRICTS

================================================

Use ONLY these 33 Telangana districts:

Adilabad

Bhadradri Kothagudem

Hanamkonda

Jagtial

Jangaon

Jayashankar Bhupalpally

Jogulamba Gadwal

Kamareddy

Karimnagar

Khammam

Komaram Bheem Asifabad

Mahabubabad

Mahbubnagar

Mancherial

Medak

Medchal-Malkajgiri

Mulugu

Nagarkurnool

Nalgonda

Narayanpet

Nirmal

Nizamabad

Peddapalli

Rajanna Sircilla

Rangareddy

Sangareddy

Siddipet

Suryapet

Vikarabad

Wanaparthy

Warangal

Yadadri Bhuvanagiri

Do NOT include Andhra Pradesh or other districts.

Do NOT allow free-text district entry.

================================================

TRAINING LOCATION

================================================

Training Location must be separate from District.

When the operator selects a district, show locations belonging to that district.

Admin can:

• Add location

• Edit location

• Deactivate location

================================================

TRAINER ASSIGNMENT — CRITICAL

================================================

Create exactly 5 individual trainers:

Trainer 1

Trainer 2

Trainer 3

Trainer 4

Trainer 5

Each trainer must have a separate login.

Trainer Name is MANDATORY in the operator form.

The trainer selected by the operator becomes the owner of the grievance.

Example:

Operator selects Trainer 1

→ Submit

→ Save Trainer 1's trainer_id

→ Grievance appears ONLY in Trainer 1's dashboard.

Operator selects Trainer 2

→ Grievance appears ONLY in Trainer 2's dashboard.

Same logic for Trainers 3, 4 and 5.

IMPORTANT:

• Do NOT assign trainers based on district.

• A trainer can work in multiple districts.

• A trainer can work in multiple locations.

• District does NOT determine the trainer.

• Selected Trainer Name determines the assignment.

================================================

TRAINER PORTAL

================================================

Create:

/trainer/login

/trainer/dashboard

Each trainer has a separate secure login.

Trainer dashboard must show ONLY grievances where:

grievance.trainer_id === logged_in_trainer.trainer_id

Dashboard cards:

• Total

• Submitted

• Under Review

• In Progress

• Resolved

• Closed

Include:

• Search

• District filter

• Training Location filter

• Category filter

• Priority filter

• Status filter

• Date filter

Trainer can:

• View grievance

• Update status

• Add internal notes

• Add resolution

• Resolve

• Close

Status flow:

Submitted

→ Under Review

→ In Progress

→ Resolved

→ Closed

Keep a complete status history/timeline.

================================================

TRAINER SECURITY

================================================

Trainer 1 must NEVER be able to see Trainer 2's grievances.

Trainer 2 must NEVER be able to see Trainer 1's grievances.

Use proper role-based access control and database-level security/RLS where supported.

Changing a grievance ID in the URL must NOT allow access to another trainer's grievance.

================================================

ADMIN PORTAL

================================================

Create:

/admin/login

/admin/dashboard

Admin can see ALL grievances.

Admin dashboard:

• Total Grievances

• Submitted

• Under Review

• In Progress

• Resolved

• Closed

Admin can:

• View all grievances

• Search and filter

• Manage 5 trainers

• Activate/deactivate trainers

• Reset trainer passwords

• Manage training locations

• View reports

• Export CSV

• Manage QR code

Reports:

• Grievances by Trainer

• Grievances by District

• Grievances by Location

• Grievances by Category

• Grievances by Status

• Grievances by Priority

================================================

GRIEVANCE ID

================================================

After submission automatically generate a unique ID:

GRV-2026-0001

GRV-2026-0002

etc.

Success page:

✓ Grievance Submitted Successfully

Your Grievance ID:

GRV-2026-0001

"Please save this ID to track your grievance."

Buttons:

[ Track Grievance ]

[ Submit Another Grievance ]

================================================

PUBLIC TRACKING

================================================

Create:

/track

Operator enters Grievance ID.

Show:

• Grievance ID

• Current Status

• Status Timeline

• District

• Training Location

• Trainer Name

• Category

• Subject

• Submitted Date

• Last Updated

• Resolution

Do NOT show internal/private notes.

================================================

EMAIL NOTIFICATIONS

================================================

After operator submits a grievance:

Send notification to:

1. One common team email

2. The selected trainer's email

Email should include:

• Grievance ID

• Operator Name

• Operator ID

• District

• Training Location

• Trainer Name

• Training Date

• Category

• Priority

• Subject

• Current Status

Keep email/API credentials secure.

Never expose secrets in frontend code.

================================================

UI / UX

================================================

Create a premium, clean, professional enterprise-style interface.

PUBLIC OPERATOR UI:

• Mobile-first

• Very simple

• Large touch-friendly controls

• Clear labels

• Step-based form

• Easy navigation

TRAINER / ADMIN UI:

• Professional sidebar

• Clean navbar

• Dashboard cards

• Tables

• Filters

• Charts

• Status badges

• Responsive layout

Navbar alignment must be perfect:

Logo/Portal name → LEFT

Navigation → CENTER

User actions → RIGHT

Use a consistent max-width, spacing, typography, buttons, cards and borders.

Avoid:

• Clutter

• Excessive gradients

• Excessive animations

• Cartoon graphics

• Neon colors

• Fake government branding

================================================

DATABASE

================================================

Create proper database structure for:

• Users

• Trainers

• Grievances

• Training Locations

• Grievance History

• Attachments

Every grievance must store:

grievance_id

operator_name

operator_id

mobile_number

centre_name

district

training_location

trainer_id

trainer_name

training_date

category

subject

description

priority

status

internal_notes

resolution

created_at

updated_at

================================================

FINAL NAVIGATION

================================================

PUBLIC:

/operator

/grievance

/track

TRAINER:

/trainer/login

/trainer/dashboard

/trainer/grievances/:id

ADMIN:

/admin/login

/admin/dashboard

/admin/grievances

/admin/trainers

/admin/locations

/admin/reports

/admin/qr

================================================

COMPLETE WORKFLOW

================================================

ONE COMMON QR

↓

/operator

↓

[ Submit Grievance ] OR [ Track Grievance ]

SUBMIT:

Operator Details

↓

Training Details

↓

District

↓

Location

↓

Trainer Name

↓

Grievance Details

↓

Review

↓

Submit

↓

Generate GRV ID

↓

Save to Database

↓

Common Team Email

+

Selected Trainer Email

↓

ONLY SELECTED TRAINER'S DASHBOARD

↓

Trainer Reviews

↓

Status Updates

↓

Resolution

↓

Closed

TRACK:

QR

↓

/operator

↓

Track Grievance

↓

Enter GRV ID

↓

View Status + Timeline + Resolution

IMPORTANT:

Build the actual working application, not a static mockup.

Do not create fake trainer routing.

The selected Trainer Name MUST determine the trainer_id and dashboard assignment.

Do not expose Admin or Trainer login on the public QR/operator page.

Preserve all existing working functionality if this is an existing project, and improve the UI/UX without breaking the workflow.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
