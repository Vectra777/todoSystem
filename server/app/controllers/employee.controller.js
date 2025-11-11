const db = require('../models');
const { ensureAuthenticated, hashPassword } = require('../authentication/utils');
const Employee = db.employees;
const utils = require('../authentication/utils');

const HR_ROLES = ['hr', 'rh', 'admin'];

// Sanitize employee data (remove sensitive fields)
function sanitizeEmployee(employeeInstance) {
    if (!employeeInstance) return null;
    const plain = employeeInstance.toJSON ? employeeInstance.toJSON() : employeeInstance;
    return {
        id: plain.id,
        firstname: plain.firstname,
        lastname: plain.lastname,
        email: plain.email,
        role: plain.role,
        is_active: plain.is_active
    };
}

// Generate next employee ID
const generateNextEmployeeId = async () => {
    const lastEmployee = await Employee.findOne({
        order: [['created_at', 'DESC']],
        attributes: ['id']
    });

    if (!lastEmployee || !/^e\d+$/i.test(lastEmployee.id)) {
        return 'e1';
    }

    const currentNumber = parseInt(lastEmployee.id.slice(1), 10) || 0;
    return `e${currentNumber + 1}`;
};

// Create a new Employee
exports.create = async (req, res) => {
    if (!ensureAuthenticated(req, res)) return;

    // Validate request
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        res.status(400).send({
            message: "Firstname, lastname and email are required!"
        });
        return;
    }

    try {
        // Hash the password
        const password = req.body.password || 'password';
        const password_hash = await hashPassword(password);

        // Create an Employee
        // Prevent creating 'admin' via this route — use createAdmin for that.
        let requestedRole = (req.body.role || 'employee').toString().toLowerCase();
        if (requestedRole === 'admin') requestedRole = 'employee';
        const employee = {
            id: await generateNextEmployeeId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password_hash: password_hash,
            role: requestedRole,
            is_active: false
        };

        // Save Employee in the database
        const data = await Employee.create(employee);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Employee."
        });
    }
};




// Retrieve all Employees
exports.findAll = (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    Employee.findAll()
        .then(data => {
            // Sanitize employee data before sending
            const sanitized = data.map(emp => sanitizeEmployee(emp));
            res.send(sanitized);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving employees."
            });
        });
}

// Create a new Admin user (only callable by existing admin)
exports.createAdmin = async (req, res) => {
    // allow programmatic calls from localhost OR authenticated admin users
    const hasAuthHeader = req.headers && req.headers.authorization;
    if (hasAuthHeader) {
        // Must be an authenticated admin
        const decoded = ensureAuthenticated(req, res);
        if (!decoded) return; // ensureAuthenticated already sent response
        const callerRole = (decoded.role || '').toLowerCase();
        if (callerRole !== 'admin') return res.status(403).send({ message: 'Forbidden: admin role required' });
    } else {
        // No Authorization header: allow only localhost access for this endpoint
        const ip = req.ip || req.connection.remoteAddress || '';
        if (!(ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')) {
            return res.status(403).send({ message: 'Forbidden: admin creation allowed only from localhost or by authenticated admin' });
        }
    }

    // Validate request
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        res.status(400).send({ message: "Firstname, lastname and email are required!" });
        return;
    }

    try {
        const normalizedEmail = String(req.body.email).toLowerCase();

        // Prevent duplicate accounts for same email
        const existing = await Employee.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            return res.status(409).send({ message: 'An account already exists for this email address' });
        }

        // Hash the password (use provided or fallback)
        const password = req.body.password || 'password';
        const password_hash = await hashPassword(password);

        const employeePayload = {
            id: await generateNextEmployeeId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: normalizedEmail,
            password_hash: password_hash,
            role: 'admin',
            is_active: true
        };

        const created = await Employee.create(employeePayload);
        res.status(201).send(sanitizeEmployee(created));
    } catch (err) {
        res.status(500).send({ message: err.message || "Some error occurred while creating the admin." });
    }
}