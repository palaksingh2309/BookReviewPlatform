Sprint 1 — Foundation (The Most Important Sprint)
Goal

At the end of Sprint 1, you should have:

Next.js project
Supabase connected
Authentication working
Profile page
Protected routes
Responsive layout
Dark mode
GitHub repository
Deployment preview

Everything else depends on this sprint.

Week 1: Understanding the Stack
What is Next.js?

Think of a website as a city.

React gives you bricks.

Next.js builds the entire city.

It provides:

Routing
SEO
Server rendering
API endpoints
Image optimization
Deployment support

Without Next.js, you'd have to build all of these yourself.

What is Supabase?

Supabase is like Firebase, but built on PostgreSQL.

Instead of setting up:

PostgreSQL
Express.js
Authentication
File storage
Email verification
Security
Database hosting

individually, Supabase provides them together.

Supabase

├── PostgreSQL
├── Authentication
├── Storage
├── SQL Editor
├── Row Level Security
├── Realtime
└── APIs
Project Folder Structure
bookverse/

src/

app/

components/

lib/

hooks/

types/

actions/

services/

public/

styles/

Each folder has a purpose.

For example:

components/

Contains reusable UI pieces like:

Navbar
Book Card
Review Card

lib/

Contains reusable utilities.

Example:

supabase.ts

auth.ts

utils.ts

actions/

Contains Server Actions.

Instead of calling REST APIs manually, Next.js lets you write server-side functions directly.

Example:

createReview()

createBook()

updateProfile()
Week 2: Git & GitHub

Before writing real code:

git init

↓

GitHub Repository

↓

Push project

↓

Commit every feature

Recruiters want to see commit history, not one massive final commit.

Week 3: Supabase Setup

You will:

Create a Supabase project
Learn environment variables
Connect Next.js
Create your first table

You'll also learn what happens when you click Create Project.

Supabase creates:

PostgreSQL Database

↓

Authentication

↓

Storage

↓

REST API

↓

Realtime Engine

Automatically.

Week 4: Authentication

You'll implement:

Sign Up
Login
Logout
Forgot Password
Email Verification
Google Login

You'll learn concepts like:

Sessions

When you log in:

Email

Password

↓

Supabase checks database

↓

Valid?

↓

Creates Session

↓

Browser stores session securely

↓

Future requests identify you automatically

No need to log in again until the session expires.

JWT

After login:

Supabase issues a JWT (JSON Web Token).

It contains:

User ID
Email
Expiration time

Every request includes this token, allowing the server to know who you are.

Row Level Security (RLS)

This is one of the most important concepts in Supabase.

Suppose your profiles table looks like:

id	username
1	Palak
2	Harsh

Without RLS:

Anyone could update anyone's profile.

With RLS:

Only update profile

WHERE

auth.uid() = id

If you log in as Palak, you can only modify Palak's row.

Sprint 2 — Books & Database Design

This sprint teaches database modeling.

Instead of creating one huge table, you'll normalize the data.

For example:

A book can have multiple genres.

"Harry Potter" belongs to:

Fantasy
Adventure
Young Adult

If you stored genres as plain text:

Fantasy,Adventure,YA

searching becomes difficult.

Instead:

Books

id

title
Genres

id

name
BookGenres

book_id

genre_id

This is called a many-to-many relationship.

You'll learn:

Primary keys
Foreign keys
One-to-one
One-to-many
Many-to-many
Indexes
Cascading deletes

You'll also build:

Add book
Edit book
Delete book
Book details
Search
Filters
Pagination
Sprint 3 — Social Features

Now the platform becomes interactive.

You'll design tables like:

Reviews
Comments
Likes
Followers
Notifications

Example:

Palak

↓

writes review

↓

Review saved

↓

Harsh likes review

↓

Like saved

↓

Notification created

↓

Palak sees notification

You'll learn:

Database transactions
Optimistic UI
Nested comments
Real-time updates
Notification design
Sprint 4 — Reading Experience & Analytics

This sprint focuses on personalization.

You'll implement:

Reading progress
Reading goals
Reading streaks
Statistics
Charts
Saved quotes
Notes

You'll also learn SQL aggregate functions like:

COUNT
SUM
AVG
GROUP BY

These power dashboards such as:

Books read this month
Pages read
Average rating
Favorite genre
Sprint 5 — Production & Deployment

The final sprint prepares the app for real users.

You'll add:

Admin dashboard
Reported reviews
Book requests
SEO
Performance optimization
Image optimization
Error handling
Deployment to Vercel
Documentation
Demo data
Final testing

You'll also learn:

Caching
Server-side rendering (SSR)
Static generation
Metadata
Open Graph tags
Security best practices
Deployment pipeline
The Most Important Principle

Instead of thinking:

"I need to build 30 features."

Think:

"I need to build one feature completely."

For every feature, follow the same cycle:

Plan – What problem does it solve? What data is needed?
Design – Sketch the UI and database changes.
Database – Create tables, relationships, indexes, and RLS policies.
Backend – Implement Server Actions or queries to read/write data.
Frontend – Build forms, pages, and reusable components.
Validation – Validate inputs with Zod and show helpful errors.
Testing – Verify success cases, failures, permissions, and edge cases.
Commit – Push the completed feature to GitHub with a clear commit message.