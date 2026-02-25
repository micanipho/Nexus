# Nexus: Sales Automation & Intelligence

**Nexus** is an Enterprise Sales Automation System designed to streamline B2B sales operations, pipeline tracking, and contract renewals. It provides a structured platform for managing high-value enterprise sales lifecycles within a single solution.

---

## Overview

Nexus addresses the challenges of manual sales processes and fragmented tracking by providing organizational visibility, accountability, and proactive revenue protection.

### Core Modules:
*   **Pipeline & Opportunity Tracking:** Real-time visibility into deal stages from discovery to closed-won.
*   **Pricing & Proposal Management:** Structured workflows for pricing requests with priority-based monitoring.
*   **Contract & Renewal Monitoring:** Proactive tracking of active SLAs to prevent revenue leakage.
*   **Client & Contact CRM:** Centralized directory for enterprise accounts and engagement history.
*   **Activity & Engagement Tracking:** Integrated logging for meetings, calls, and tasks.
*   **Executive & Personal Analytics:** High-level organizational dashboards and individual performance tracking.

---

## Technology Stack

*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
*   **UI Library:** [Ant Design (antd) 6.x](https://ant.design/)
*   **State Management:** [Provider Pattern](./providerPattern.md) (Context API + `redux-actions`)
*   **Language:** [TypeScript (Strict Mode)](https://www.typescriptlang.org/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Visualization:** [@ant-design/plots](https://ant-design-charts.antgroup.com/)

---

## Project Architecture

The project follows a domain-driven structure within the `src/` directory:

```text
src/
├── app/                              # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                       # Auth group (Login, Register)
│   ├── (main)/                       # Main application shell
│   └── layout.tsx                    # Root layout (Config, AppProviders)
│
├── providers/                        # State Management Layer (Context Providers)
│   ├── authProvider/                 # Auth state & actions
│   ├── clientProvider/               # CRM state
│   ├── dashboardProvider/            # Analytics state
│   └── ...                           # Domain-specific providers
│
├── components/                       # UI Components
│   ├── layout/                       # Sidebar, Topbar, Shell components
│   ├── shared/                       # Reusable UI (DataTable, StatusBadge, etc.)
│   └── features/                     # Domain-specific complex components
│
├── services/                         # API Integration Layer (Axios)
│   ├── api.ts                        # Axios instance & interceptors
│   ├── authService.ts                # Auth API
│   └── ...                           # Domain services with mock fallbacks
│
└── types/                            # Strict TypeScript Contracts
    ├── index.ts                      # Centralized Domain Interfaces
    ├── enums.ts                      # Business logic Enums
    └── auth.ts                       # Auth-specific types
```

---

## State Management: The Provider Pattern

This project uses a strictly typed, Redux-like architecture utilizing the React Context API. Each domain (e.g., Clients, Auth) has a dedicated provider directory containing:
- `context.tsx`: State and Action context definitions.
- `actions.tsx`: Action types and synchronous creators.
- `reducer.tsx`: State transition logic using `handleActions`.
- `index.tsx`: The Provider component and custom hooks (`useDomain`, `useDomainActions`).

Refer to [providerPattern.md](./providerPattern.md) for detailed documentation.

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm

### Installation
1.  **Clone and Install:**
    ```bash
    git clone https://github.com/your-org/nexus-sales.git
    cd nexus-sales
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

