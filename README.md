# CloudWeaver — Serverless Cloud Deployment & Management Platform 🚀

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF.svg)](https://vite.dev/)
[![TanStack Router](https://img.shields.io/badge/TanStack-Router-FF4154.svg)](https://tanstack.com/)

CloudWeaver is a next-generation, Vercel-style **serverless cloud hosting dashboard** designed to manage serverless functions, compute instances, database clusters, SSL domains, and monitoring log streams.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running Locally](#-running-locally)
- [License](#-license)

---

## ✨ Features

### 💻 Compute & Orchestration
* **VPS/Compute Instances:** Spin up, restart, and monitor virtual server instances.
* **Serverless Functions:** Deploy and route auto-scaling REST/HTTP endpoints.
* **Database Clusters:** Manage PostgreSQL, Redis, and MongoDB databases.

### 🌐 Networking & Security
* **Domains Manager:** Bind custom domains with automated Let's Encrypt SSL/TLS certificates.
* **API Keys & Secrets:** Vault-secure credentials manager for environment variables.
* **Networking Firewalls:** Configure load balancers, rate limiters, and traffic rules.

### 📊 Observability & Metrics
* **Real-time Monitoring:** Graphs showing CPU usage, RAM utilization, and request throughput.
* **Aggregated Log Streams:** Scrollable, search-filtered server and runtime console stdout/stderr.
* **Billing & Analytics:** Transparent usage tracking, bandwidth meters, and invoice generation.

---

## 🛠 Tech Stack

### Frontend
* **Core:** React 19, TypeScript
* **Routing:** TanStack React Router & TanStack React Start (SSR-ready)
* **Styling:** Tailwind CSS v4, Lucide Icons
* **State Management:** Redux Toolkit
* **Analytics:** Recharts
* **Forms & Validation:** React Hook Form, Zod

### Backend Integrations
* **API Engine:** Integrates with deployment systems (K8s, Docker Swarm, and VPS providers)
* **Secure Storage:** Secrets storage vault

---

## 📁 Project Structure

```
cloud.sharexpress/
├── src/
│   ├── components/                    # Reusable UI component elements
│   │   └── ui/                        # Radix UI wrapper controls (dialog, card, input)
│   ├── routes/                        # TanStack Router page templates
│   │   ├── api-keys.jsx               # API Credentials panel
│   │   ├── billing.jsx                # Billing & Stripe metrics
│   │   ├── compute.jsx                # Compute VPS provisioning
│   │   ├── dashboard.jsx              # Main status grid
│   │   ├── databases.jsx              # Database clusters
│   │   ├── deployments.jsx            # Build history list
│   │   ├── docs.jsx                   # Platform developer docs
│   │   ├── domains.jsx                # Custom domain proxy
│   │   ├── functions.jsx              # Serverless handlers
│   │   ├── monitoring.jsx             # Analytical charts
│   │   ├── networking.jsx             # Load balancer rules
│   │   ├── projects.jsx               # Active workspace list
│   │   ├── secrets.jsx                # Safe env storage
│   │   ├── settings.jsx               # Account settings
│   │   └── team.jsx                   # Collaborative access
│   ├── styles.css                     # Tailwind v4 directives
│   ├── router.jsx                     # Route mappings
│   └── main.jsx                       # React app boots
├── vite.config.js                     # Bundle adjustments
├── tsconfig.json                      # Type restrictions
└── package.json                       # Scripts and modules
```

---

## 🚀 Setup & Launch Guidelines

### Prerequisites
* **Node.js**: `v20.19+` (Recommended) or `v22.12+`
* **Bun** (Optional, for rapid installation)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/sharexpress/cloud.sharexpress.in.git
cd cloud.sharexpress.in

# Install dependencies
npm install
# or if using bun:
bun install
```

### 2. Running Locally
```bash
# Run the hot-reloading development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📄 License
This project is licensed under the Apache License 2.0. See the `LICENSE` file for details.
