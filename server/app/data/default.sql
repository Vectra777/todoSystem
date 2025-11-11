-- Insert test data
-- Employees
INSERT INTO employees (id, firstname, lastname, email, password_hash, role, is_active) VALUES
('e1', 'Johnny', 'Smith', 'john.smith@company.com', 'hash123', 'admin', true),
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

-- Files
INSERT INTO files (id, competence_id, extension, name) VALUES
(1, 1, 'pdf', 'vue_certification.pdf'),
(2, 2, 'png', 'ux_mockup.png'),
(3, 2, 'fig', 'design_system.fig'),
(4, 3, 'sql', 'database_schema.sql');

-- Team Tasks
INSERT INTO team_tasks (team_id, competence_id, created_at) VALUES
('t1', 1, '2025-01-01'),
('t1', 3, '2025-02-01'),
('t2', 2, '2025-01-15'),
('t3', 4, '2025-03-01');
