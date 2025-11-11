-- Drop database if exists and create new one
DROP DATABASE IF EXISTS db_todo;
CREATE DATABASE db_todo;
USE db_todo;

-- Create tables
CREATE TABLE employees (
    id VARCHAR(10) PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    id VARCHAR(10) PRIMARY KEY,
    team_name VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    team_id VARCHAR(10),
    employee_id VARCHAR(10),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, employee_id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE competences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    start_date DATE,
    end_date DATE,
    label VARCHAR(100)
);

CREATE TABLE user_tasks (
    competence_id INT,
    employee_id VARCHAR(10),
    status VARCHAR(50) NOT NULL,
    employee_review TEXT,
    hr_review TEXT,
    PRIMARY KEY (competence_id, employee_id),
    FOREIGN KEY (competence_id) REFERENCES competences(id),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    competence_id INT,
    extension VARCHAR(10),
    name VARCHAR(255),
    original_name VARCHAR(255),
    stored_name VARCHAR(255),
    mime_type VARCHAR(100),
    size INT,
    uploaded_by VARCHAR(10),
    FOREIGN KEY (competence_id) REFERENCES competences(id),
    FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE team_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(10),
    competence_id INT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (competence_id) REFERENCES competences(id) ON DELETE CASCADE
);

-- Insert test data
-- Employees
INSERT INTO employees (id, firstname, lastname, email, password_hash, role, is_active) VALUES
('e1', 'John', 'Smith', 'john.smith@company.com', 'hash123', 'admin', true),
('e2', 'Emily', 'Johnson', 'emily.johnson@company.com', 'hash124', 'employee', true),
('e3', 'Michael', 'Brown', 'michael.brown@company.com', 'hash125', 'employee', true),
('e4', 'Sarah', 'Wilson', 'sarah.wilson@company.com', 'hash126', 'employee', true);

-- Teams
INSERT INTO teams (id, team_name, description) VALUES
('t1', 'Development', 'Web Development Team'),
('t2', 'Design', 'UX/UI Design Team'),
('t3', 'Marketing', 'Digital Marketing Team');

-- Team Members
INSERT INTO team_members (team_id, employee_id, role) VALUES
('t1', 'e1', 'Team Lead'),
('t1', 'e2', 'Developer'),
('t2', 'e3', 'Designer'),
('t2', 'e4', 'UX Researcher'),
('t3', 'e2', 'Content Creator');

-- Competences
INSERT INTO competences (id, title, description, start_date, end_date, label) VALUES
(1, 'Vue.js', 'Mastery of Vue.js framework', '2025-01-01', '2025-12-31', 'Frontend'),
(2, 'UX Design', 'User Experience Design Principles', '2025-01-01', '2025-12-31', 'Design'),
(3, 'MySQL', 'Database Management with MySQL', '2025-01-01', '2025-12-31', 'Backend'),
(4, 'SEO', 'Search Engine Optimization', '2025-01-01', '2025-12-31', 'Marketing');

-- User Tasks
INSERT INTO user_tasks (competence_id, employee_id, status, employee_review, hr_review) VALUES
(1, 'e2', 'In Progress', 'Making good progress with Vue.js', 'Good evolution'),
(2, 'e3', 'Completed', 'Successfully completed UX project', 'Excellent work'),
(3, 'e1', 'In Progress', 'Creating new database queries', NULL),
(4, 'e4', 'To Do', NULL, NULL);

INSERT INTO files (id, competence_id, extension, name) VALUES
(1, 1, 'pdf', 'vue_certification.pdf'),
(2, 2, 'png', 'ux_mockup.png'),
(3, 2, 'fig', 'design_system.fig'),
(4, 3, 'sql', 'database_schema.sql');

-- Team Tasks
INSERT INTO team_tasks (id, team_id, competence_id, start_date, end_date) VALUES
(1, 't1', 1, '2025-01-01', '2025-06-30'),
(2, 't1', 3, '2025-02-01', '2025-08-31'),
(3, 't2', 2, '2025-01-15', '2025-04-30'),
(4, 't3', 4, '2025-03-01', '2025-09-30');