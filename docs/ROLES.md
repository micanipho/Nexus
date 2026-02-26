# Roles & Permissions

## Overview

Nexus uses a role-based access control (RBAC) system. Each user belongs to a **tenant** (organisation) and is assigned one of four roles.

## Roles

| Role                           | How to obtain                                            | Access level                                                                           |
| ------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Admin**                      | Register with `tenantName`, or assigned by another Admin | Full access — all endpoints including delete, approve, reject, assign, user management |
| **SalesManager**               | Register with `"role":"SalesManager"` when joining       | Full access including approve/reject proposals, assign opportunities, delete records   |
| **BusinessDevelopmentManager** | Register with `"role":"BusinessDevelopmentManager"`      | Create and manage opportunities, proposals, pricing requests, contracts, activities    |
| **SalesRep**                   | Default when no role specified                           | Read own data, create activities and pricing requests, update assigned records         |

## Registration Scenarios

### Scenario A — Create a New Organisation

The registering user becomes the **Admin**.

```json
{
  "email": "alice@acme.com",
  "password": "Pass@123",
  "firstName": "Alice",
  "lastName": "Smith",
  "tenantName": "Acme Corp"
}
```

### Scenario B — Join an Existing Organisation

Requires the organisation's **Tenant ID** from an existing Admin.

```json
{
  "email": "bob@acme.com",
  "password": "Pass@123",
  "firstName": "Bob",
  "lastName": "Jones",
  "tenantId": "63d7bdc1-d2c4-488c-98c7-15c8d0657d58",
  "role": "SalesManager"
}
```

### Scenario C — Quick Start (Default Tenant)

No organisation specified — falls back to the system default tenant. Role defaults to **SalesRep**.

```json
{
  "email": "carol@test.com",
  "password": "Pass@123",
  "firstName": "Carol",
  "lastName": "White",
  "role": "SalesRep"
}
```
