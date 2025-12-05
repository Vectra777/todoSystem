# 🧭 TODO — The Competence Tracker

![Vue.js](https://img.shields.io/badge/Vue.js-3.5.22+-42b883?logo=vuedotjs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-Academic-blue)
![Status](https://img.shields.io/badge/status-In%20Development-orange)

> “Managing people should be about growth, not spreadsheets.”


## 📘 Overview

**TODO** is a full-stack web application to **manage companies, teams, employees, and competencies**.  
It enables users to **create teams, add employees, track skills, attach files, and write Markdown descriptions for competencies**, while ensuring **secure authentication and automated email notifications**.


## 🚀 Key Features

- 👥 **Team & Employee Management**  
  - Create, modify, and delete teams and employees.  
  - Assign employees to teams.  

- 🧩 **Competence Management**  
  - Associate competencies to employees or teams.  
  - Attach files and resources to competencies.  
  - Write descriptions in **Markdown** format.  

- 📧 **Automated Email Notifications**  
  - Notify relevant users on major updates (e.g., new competencies, team changes).  

- 🔐 **Secure Authentication**  
  - Cookie-based session authentication.  
  - Creation of companies and first admin for each enterprise.  
  - Passwords hashed with **bcrypt**.  

- 📊 **Dashboards & Insights**  
  - View team and company-wide competency progress.  
  - Filter by employee, team, or competence.  

- 🖥️ **Frontend & UX**  
  - Built with **Vue.js 3** and **Pinia** for state management (`useStore`).  
  - Multi-view modes: **Kanban**, **List**, **Calendar**.  

- ⚙️ **Backend & Database**  
  - **Node.js + Express** API.  
  - **SQL database** via Sequelize ORM.  
  - Handles companies, teams, employees, and competencies.  


## 🖥️ App Pages

| Page | Description |
|------|-------------|
| 🏠 **Home** | Landing page with app introduction and navigation. |
| 🔑 **Login / Register** | Secure authentication with cookies and session management. |
| 👤 **Profile** | View and edit personal info, competencies, and password. |
| 🧭 **HR Dashboard** | Overview of teams, employees, and company-wide skill tracking. |
| 🧠 **Competence Management** | Create, edit, and view competencies; attach files and Markdown descriptions. |
| 🏢 **Team Management** | Create and manage teams; assign competencies and employees. |


## 🏗️ Architecture

### Frontend
- **Framework:** Vue.js 3  
- **State Management:** Pinia (`useStore`)  
- **Routing:** Vue Router  
- **UI:** Bootstrap + custom styling  
- **Authentication:** Cookie-based sessions  

### Backend
- **Framework:** Node.js + Express  
- **Database:** SQL (MySQL) via Sequelize ORM  
- **Security:** bcrypt for password hashing, cookie sessions  
- **Notifications:** Automated email sending on major updates  



## 🧩 Main Use Cases

### 👤 Employee
- View personal competencies and assigned tasks.  
- Update progress and leave feedback.  

### 🧠 Manager
- Create and manage teams and employees.  
- Define and assign competencies.  
- Attach resources and Markdown descriptions.  
- Track team performance and progress.  

### 🏢 HR / Admin
- Manage company-wide teams, employees, and competencies.  
- Monitor progress and generate reports.  
- Receive automatic notifications for major updates.  
- Create new enterprises and first admin accounts.  


## 🗓️ Roadmap

| Milestone | Date | Objectives | Status |
|------------|------|------------|--------|
| **1** | Oct 6, 2025 | Documentation, mockups, DB schema | ✅ |
| **2** | Nov 3, 2025 | Frontend development (Vue.js + Pinia) | ✅ |
| **3** | Dec 8, 2025 | Backend (API, auth, integration, emails) | ✅ |



## ⚙️ Installation & Setup (Docker)

### Prerequisites
- Docker / Docker Compose  
- Node.js ≥ 18  
- Git  

### Clone the repository
```bash
git clone https://github.com/yourusername/competence-tracker.git
cd competence-tracker
```

### Run with Docker Compose
```bash
docker-compose up -d --build
```
This will:
- Start the backend (Node.js + Express)
- Start the frontend (Vue.js)
- Start the MySQL database

To access the server admin panel, access: http://localhost:3000/admin-panel?token=choose-a-strong-token

To acces frontend: http://localhost:8080

## 👥 Contributors

We would like to thank everyone who contributed to the development of **Competence Tracker**.  
Roles are defined according to the tasks completed across different milestones.

| Contributor | Role | Contributions | Profile |
|-------------|------|---------------|---------|
| <img src="https://avatars.githubusercontent.com/u/151140965?v=4" width="50"/> **Antoine** | Full-Stack Developer | Database setup, Home Page, HR Dashboard, Schedules, Competences API backend, Search Teams/Users API | [GitHub](https://github.com/AnToIn-E-CoDe) |
| <img src="https://avatars.githubusercontent.com/u/110352270?v=4" width="50"/> **Alexis** | Frontend & Integration Developer | Login page, About page, Profile page, Use cases, HR Dashboard forms, Integration of Competences API in frontend, Email sending| [GitHub](https://github.com/AlexisDemont) |
| <img src="https://avatars.githubusercontent.com/u/76227531?v=4" width="50"/> **Valentin** | Frontend & Auth Developer | Dashboard design (Kanban, List, Calendar), User interaction with tasks, JWT & tokens, GitHub repository setup, Email sending, File handling | [GitHub](https://github.com/Vectra777) |


## 📄 License

**Academic use only** — CEWP MOD8 GRB 2252 (Fall 2025),  
Concordia University.
