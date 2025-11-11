-- Insert test data

-- Companies
INSERT INTO companies (id, name) VALUES
(1, 'Tech Solutions Inc.');


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
(
    1,
    'Express',
    '# 🚀 Microservice Optimization: High-Performance Express API\n\n## 🎯 Project Objective\nMaster the design, development, and deployment of **high-performance, stateless microservices** using **Node.js** and **Express.js**. The goal is to build a robust, scalable API capable of handling heavy production loads while maintaining low latency and high reliability.\n\n---\n\n## 🛠️ Key Focus Areas & Learning Outcomes\n\n| Focus Area | Description | Deliverables |\n| :---| :---| :--- |\n| **Event Loop Deep Dive** | Understand Node.js asynchronous patterns and non-blocking I/O to prevent performance bottlenecks. | Profiling reports showing low Event Loop block time. |\n| **Clustering & Load Balancing** | Implement horizontal scaling mechanisms to distribute traffic and ensure high availability (HA). | Configuration files for PM2/Nginx/Docker Swarm. |\n| **Secure Session Management** | Implement modern, token-based authentication (JWT, OAuth2) and secure API endpoints. | Implementation of required middleware and authentication flow. |\n| **Caching & Performance** | Integrate external caching layers (Redis/Memcached) to significantly optimize read response times. | Redis integration code and performance benchmarks. |\n| **Monitoring & Profiling** | Set up tools to detect memory leaks, monitor system health, and track performance under stress. | Grafana/New Relic dashboards and load test results. |\n\n---\n\n## ✅ Validation Criteria\n* **Performance:** Deploy a fully functional API endpoint capable of handling **500+ requests per second** under stress testing.\n* **Stability:** Ensure **zero memory leaks** are detected during sustained load over a 24-hour period.\n* **Observability:** Monitor latency and throughput with live dashboards.\n\n---\n\n## 🔗 Resources\n* [Node.js Official Docs](https://nodejs.org/en/docs/)\n* [Express.js Guide](https://expressjs.com/)\n* [Redis Documentation](https://redis.io/docs/)\n* [JWT Authentication](https://jwt.io/introduction/)\n',
    '2025-01-01 00:00:00',
    '2025-12-31 00:00:00',
    'Backend'
),
(
    2,
    'UX Design',
    '# 🎨 User Experience (UX) Design Principles Project\n\n## 🎯 Project Objective\nApply fundamental UX design principles to create a user-centered, accessible, and intuitive digital product interface (e.g., a web application or mobile app). Focus on the entire design process, from research and ideation to prototyping and validation.\n\n---\n\n## 🛠️ Key Focus Areas & Learning Outcomes\n\n| Focus Area | Description | Deliverables |\n| :---| :---| :--- |\n| **User Research & Analysis** | Conduct interviews, surveys, and competitive analysis to identify user needs and pain points. | User Personas, Journey Maps, and Research Summary. |\n| **Information Architecture (IA)** | Define the organization, structure, and labeling of content to help users find information. | Site Map (PNG), and Navigation Flow Diagram. |\n| **Wireframing & Prototyping** | Create low-fidelity wireframes and interactive high-fidelity prototypes. | Figma/Sketch/Framer project file containing wireframes and prototypes. |\n| **Usability Testing** | Design and conduct usability tests to gather feedback and iterate on design flaws. | Usability Test Plan and Summary Report with design recommendations. |\n| **Accessibility (WCAG)** | Ensure the final design meets WCAG standards for color contrast, keyboard navigation, and screen reader compatibility. | Accessibility Audit Report. |\n\n---\n\n## ✅ Validation Criteria\n* **Usability Score:** Achieve a System Usability Scale (SUS) score of 80 or higher based on testing.\n* **Deliverable:** A complete, interactive prototype and a final Design System/Style Guide.\n* **Presentation:** Successful presentation of the design rationale and validation findings to stakeholders.\n\n---\n\n## 🔗 Resources\n* [Nielsen Norman Group Articles](https://www.nngroup.com/articles/)\n* [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)\n* [Design System Examples](https://designsystemsrepo.com/)\n',
    '2025-01-01 00:00:00',
    '2025-12-31 00:00:00',
    'Design'
),
(
    3,
    'MySQL',
    '# 💾 Database Management with MySQL: Schema & Optimization\n\n## 🎯 Project Objective\nDesign, implement, and optimize a robust relational database schema using **MySQL**. Focus on advanced SQL techniques, ensuring data integrity, high query performance, and transactional consistency for a production-level application.\n\n---\n\n## 🛠️ Key Focus Areas & Learning Outcomes\n\n| Focus Area | Description | Deliverables |\n| :---| :---| :--- |\n| **Schema Design & Normalization** | Create an efficient schema up to 3NF (Third Normal Form) to minimize data redundancy. | **``database_schema.sql``** file (DDL/DML). |\n| **Indexing & Performance Tuning** | Identify and apply appropriate indexing strategies (B-Tree, Hash, Full-Text) to speed up common queries. | Query optimization reports and EXPLAIN ANALYZE results. |\n| **Stored Procedures & Functions** | Develop reusable SQL code for complex business logic to improve efficiency and security. | Collection of Stored Procedures and Triggers (SQL files). |\n| **Security & Backup** | Implement user roles, permissions, and define a consistent data backup and recovery strategy. | Security configuration script and daily backup procedures. |\n| **Transaction Management** | Understand ACID properties and implement explicit transaction controls to maintain data consistency. | Examples of transactions using `BEGIN`, `COMMIT`, and `ROLLBACK`. |\n\n---\n\n## ✅ Validation Criteria\n* **Integrity:** Successful enforcement of all Foreign Key constraints and unique indexes during data migration.\n* **Performance:** All critical read queries must execute in under **50ms**.\n* **Documentation:** A comprehensive ER (Entity-Relationship) diagram.\n\n---\n\n## 🔗 Resources\n* [MySQL Official Documentation](https://dev.mysql.com/doc/)\n* [SQL Normalization Guide](https://www.w3schools.com/sql/sql_normalization.asp)\n* [Database Design Best Practices](https://www.oreilly.com/library/view/database-design-for/9781449352934/)\n',
    '2025-01-01 00:00:00',
    '2025-12-31 00:00:00',
    'Backend'
),
(
    4,
    'SEO',
    '# 📈 Search Engine Optimization (SEO) Strategy & Implementation\n\n## 🎯 Project Objective\nDevelop and execute a comprehensive SEO strategy to significantly improve organic search engine rankings, drive qualified traffic, and enhance the online visibility of a target website or digital product.\n\n---\n\n## 🛠️ Key Focus Areas & Learning Outcomes\n\n| Focus Area | Description | Deliverables |\n| :---| :---| :--- |\n| **Keyword Research** | Identify high-intent, low-competition keywords relevant to the target audience and content. | Detailed Keyword Map and Competitive Analysis Report. |\n| **On-Page Optimization** | Implement technical best practices for content, HTML structure (H-tags, alt text), and internal linking. | Optimized landing page templates and Content Audit. |\n| **Technical SEO Audit** | Analyze site speed (Core Web Vitals), crawlability (Robots.txt, Sitemap), and mobile-friendliness. | Technical Audit Report highlighting critical fixes. |\n| **Content Strategy** | Plan, create, and optimize high-quality content that addresses user intent at various stages of the funnel. | Content Calendar for 3 months with topic clusters. |\n| **Link Building** | Develop a strategy for acquiring high-authority, relevant backlinks (Off-Page SEO). | Backlink Acquisition Plan and Outreach Template. |\n\n---\n\n## ✅ Validation Criteria\n* **Ranking:** Achieve a top 10 ranking for 5 target non-branded keywords within 6 months.\n* **Traffic:** Increase organic search traffic by at least **30%** over the project duration.\n* **Site Health:** Achieve a Google Lighthouse SEO score of **95+**.\n\n---\n\n## 🔗 Resources\n* [Google Search Central Documentation](https://developers.google.com/search/docs)\n* [Moz Beginner''s Guide to SEO](https://moz.com/beginners-guide-to-seo)\n* [Google''s Core Web Vitals Report](https://web.dev/vitals/)\n',
    '2025-01-01 00:00:00',
    '2025-12-31 00:00:00',
    'Marketing'
);

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


