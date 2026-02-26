# Nexus Sales Automation

## What is Nexus?

Nexus is an Enterprise Sales Automation System designed to revolutionize the way B2B sales teams track, manage, and close high-value deals. With a streamlined interface and powerful intelligence features, our application connects sales representatives, managers, and directors with real-time pipeline data, providing personalized sales insights tailored to individual organizational goals.

## Why Choose Nexus?

**Operational Excellence:** We prioritize efficiency and accuracy in sales tracking, ensuring that every opportunity is monitored from discovery to closed-won.
**Convenience:** With cloud-native access and mobile-optimized views, sales teams can manage their pipeline from anywhere, eliminating the friction of manual spreadsheet updates.
**Affordability:** We believe every organization deserves access to enterprise-grade tools. Our scalable multi-tenant architecture provides powerful features without the overhead of legacy CRM systems.
**Intelligence & Insights:** Join a data-driven sales culture where metrics like weighted pipeline value, win rates, and activity completion are at your fingertips to enhance your revenue growth.

# Documentation

## Software Requirement Specification

### Overview

Nexus is a cutting-edge Sales Automation & Intelligence platform designed to streamline the B2B sales lifecycle. It provides a unified workspace for managing clients, tracking opportunities, generating proposals, and monitoring contract renewals with built-in Role-Based Access Control (RBAC).

### Components and Functional Requirement

**1. Authentication and Authorisation Management**
  * User can register as a New Org (Admin), Join an Org (via invite/tenant ID), or use Quick Start.
  * User can log into the Nexus web app with secure JWT-based authentication.
  * User can access their unique profile and data scoped to their specific Tenant.

**2. Client & CRM Management**
 * User can create and manage client organizations and their primary contacts.
 * User can track engagement history and client-specific statistics.
 * Admin/Managers can deactivate or reactivate client profiles.
 
**3. Pipeline & Opportunity Management**
 * User can track sales opportunities through stages (Lead, Qualified, Proposal, Negotiation, Closed).
 * Owners can update stages and probability to reflect real-time progress.
 * Automatic calculation of pipeline value and weighted revenue.

**4. Pricing & Proposal Subsystem**

BDM / Manager
 * Log pricing requests for complex deal structures.
 * Generate professional proposals with detailed line items (Product, Quantity, Price, Tax).
 * Submit proposals for internal approval workflow.

Admin / Sales Manager
 * Review, approve, or reject pending proposals.
 * Assign pricing requests to specific team members.

**5. Contract & Renewal Monitoring**

Management
 * Convert approved proposals into active legal contracts.
 * Activate or cancel contracts based on fulfillment status.

Monitoring
 * Automatic tracking of contract expiry dates.
 * Initiate and track renewal records for expiring agreements.
 * Dashboard alerts for contracts expiring within 30 days.

**6. Activity & Engagement Tracking**

* Log and track meetings, calls, emails, and tasks.
* Mark activities as completed with specific outcomes.
* View upcoming and overdue activity summaries on the personal dashboard.

**7. Analytics & Executive Overview**

* Real-time dashboard showing projected revenue and pipeline health.
* Sales performance tracking (Top Performers, Win Rates).
* Conversion rate monitoring across different pipeline stages.

### Architecture Diagram
Nexus utilizes a modern decoupled architecture:
* **Frontend:** Next.js 16 (Turbopack), React 19, Ant Design v5 (CSS-in-JS).
* **Security:** JWT Authentication with Tenant-based data isolation.


## FRONTEND
Navigate to the project root and install dependencies:
`npm install`

## Development
Run the development server with Turbopack:
`npm run dev`

## Production
* `npm run build`
* `npm run start`

The application uses an environment variable for the API endpoint:
* `NEXT_PUBLIC_API_BASE_URI` (Defaults to Production Azure URL if not set)
