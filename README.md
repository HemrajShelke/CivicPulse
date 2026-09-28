# CivicPulse - Smart Civic Issue Reporting & Resolution Platform API 🚀

An intelligent, secure, and robust platform designed for seamless civic issue reporting, automated classification, status tracking, and community engagement.

---

## 📌 Tech Stack & Badges

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Git & GitHub](https://img.shields.io/badge/Git%20%26%20GitHub-F05032?style=for-the-badge&logo=git&logoColor=white)
![React & TypeScript](https://img.shields.io/badge/React%20%26%20TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

---

## 📖 Overview

**CivicPulse** is built using object-oriented design and clean architecture principles to bridge the gap between citizens and municipal authorities. It provides an intuitive reporting interface and a high-performance backend with role-based access control and real-time issue lifecycle tracking.

---

## 🚀 Key Highlights & Features

- **Robust REST API Architecture**:
  - Built a Java-based REST API platform for civic issue reporting and resolution using object-oriented design patterns.
- **Security & Authorization**:
  - Implemented **JWT (JSON Web Tokens)** authentication and fine-grained role-based authorization with **Spring Security**.
  - Distinct role management for:
    - 👤 **Citizens**: Report issues, track complaint status, upvote, and comment.
    - 👷 **Municipal Officers**: Manage assigned department issues, update resolution progress, and handle SLAs.
    - 🛡️ **Administrators**: System-wide oversight, user management, and analytics governance.
- **RESTful Endpoints & Features**:
  - Designed clean RESTful endpoints for:
    - 📝 Issue reporting & AI-powered category/severity detection.
    - 🔄 Real-time status tracking & SLA monitoring.
    - 💬 Multi-user comment feeds & community discussions.
    - 📸 Secure image and proof uploads.
- **DevOps & Version Control**:
  - Used **Git and GitHub** for structured branch management, code reviews, and version control.
  - Containerized with **Docker** for consistent setup across development and production environments.

---

## 🏗️ Architecture & Flow

```
[ Citizen / User ]
       │
       ▼
[ CivicPulse Frontend (React / TypeScript) ]
       │
       ▼
[ JWT Auth & Spring Security Layer ]
       ├── Citizen Access
       ├── Municipal Officer Access
       └── Admin Access
       │
       ▼
[ CivicPulse REST API & Business Logic ]
       ├── Issue Management & SLAs
       ├── Comments & Media Uploads
       └── Analytics & Geo-location Services
```

---

## 🛠️ Project Setup & Installation

### Prerequisites
- Java 17+ / Node.js 18+
- Docker (optional, for containerized run)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/HemrajShelke/CivicPulse.git
cd CivicPulse
```

### 2. Run the Application
```bash
npm install
npm run build
npm start
```

---

## 👨‍💻 Author

- **Hemraj Shelke** ([GitHub Profile](https://github.com/HemrajShelke))
