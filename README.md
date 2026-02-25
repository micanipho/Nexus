# Nexus: Sales Automation & Intelligence

**Nexus** is an Enterprise Sales Automation System designed to streamline B2B sales operations, pipeline tracking, and contract renewals. It provides a structured platform for managing high-value enterprise sales lifecycles within a single solution.

---

## 🚀 Overview

Nexus addresses the challenges of manual sales processes and fragmented tracking. It provides organizational visibility, accountability, and proactive revenue protection.

### Core Modules:
*   **Pipeline & Opportunity Tracking:** Real-time visibility into deal stages from discovery to closed-won.
*   **Pricing & Proposal Management:** Structured workflows for pricing requests with priority-based monitoring.
*   **Contract & Renewal Monitoring:** Proactive tracking of active SLAs to prevent revenue leakage.
*   **Client & Contact CRM:** Centralized directory for enterprise accounts and engagement history.
*   **Activity & Engagement Tracking:** Integrated logging for meetings, calls, and tasks.
*   **Executive & Personal Analytics:** High-level organizational dashboards and individual performance tracking.

---

## 🛠 Technology Stack

*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
*   **UI Library:** [Ant Design (antd) 6.x](https://ant.design/)
*   **Language:** [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Visualization:** [@ant-design/plots](https://ant-design-charts.antgroup.com/)

---

## 📂 Project Architecture

The project follows a domain-driven structure within the `src/` directory:

```text
src/
├── app/                              # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                       # Auth group (Login, Register)
│   ├── (main)/                       # Main application shell
│   │   ├── dashboard/                # Executive Overview
│   │   ├── clients/                  # CRM & Client Detail Views
│   │   ├── opportunities/            # Sales Pipeline
│   │   ├── pricing-requests/         # Proposal & Quote Workflows
│   │   ├── contracts/                # Contract Management
│   │   ├── profile/                  # "My Performance" Individual Dashboard
│   │   └── settings/                 # User Preferences
│   └── layout.tsx                    # Root layout (Config, Providers)
│
├── services/                         # API Integration Layer
│   ├── api.ts                        # Centralized Axios instance
│   ├── dashboardService.ts           # Metrics & Performance API
│   ├── pricingRequestService.ts      # Workflow API
│   └── ...                           # Domain-specific services
│
├── types/                            # Strict TypeScript Contracts
│   ├── index.ts                      # Centralized Domain Interfaces
│   ├── enums.ts                      # Business logic Enums (Status, Priority)
│   └── dashboard.ts                  # Analytics-specific types
│
└── components/                       # Shared UI Components
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/nexus-sales.git
    cd nexus-sales
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

---
