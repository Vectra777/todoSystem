const db = require('../models');
const { ensureAuthenticated, hashPassword } = require('../authentication/utils');
const Employee = db.employees;
const utils = require('../authentication/utils');

const HR_ROLES = ['hr', 'rh', 'admin'];

// Sanitize employee data
function sanitizeEmployee(employeeInstance) {
    if (!employeeInstance) return null;
    const plain = employeeInstance.toJSON ? employeeInstance.toJSON() : employeeInstance;
    return {
        id: plain.id,
        firstname: plain.firstname,
        lastname: plain.lastname,
        email: plain.email,
        role: plain.role,
        is_active: plain.is_active,
        company_id: plain.company_id 
    };
}

// Generate next employee ID
async function generateNextEmployeeId() {
    let last = await Employee.findOne({ order: [['created_at', 'DESC']] });
    if (!last) return 'e1';
    let num = parseInt(last.id.slice(1)) + 1;

    let candidate = 'e' + num;
    while (await Employee.findOne({ where: { id: candidate } })) {
        num++;
        candidate = 'e' + num;
    }
    return candidate;
}


// Create a new Employee 
exports.create = async (req, res) => {
    // Authenticate and get caller's data
    const decodedUser = ensureAuthenticated(req, res);
    console.log('Decoded user from token:', decodedUser);
    if (!decodedUser) return;
    
    // Get the company_id from the authenticated caller (Admin/HR)
    const callerCompanyId = decodedUser.company_id;

    if (!callerCompanyId) {
        return res.status(500).send({ message: "Internal Error: Caller's company ID is missing." });
    }

    // Validate request
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        res.status(400).send({
            message: "Firstname, lastname and email are required!"
        });
        return;
    }

    try {
        const password = req.body.password || 'password';
        const password_hash = await hashPassword(password);

        let requestedRole = (req.body.role || 'employee').toString().toLowerCase();
        if (requestedRole === 'admin') requestedRole = 'employee';
        
        const employee = {
            id: await generateNextEmployeeId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password_hash: password_hash,
            role: requestedRole,
            is_active: false,
            // ASSIGN CALLER'S company_id
            company_id: callerCompanyId 
        };

        const data = await Employee.create(employee);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Employee."
        });
    }
};


// Retrieve all Employees (scoped by company)
exports.findAll = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;

    const callerCompanyId = decodedUser.company_id;
    if (!callerCompanyId) {
        return res.status(400).send({ message: 'Company context missing for current user.' });
    }

    try {
        const employees = await Employee.findAll({
            where: { company_id: callerCompanyId },
            order: [
                ['lastname', 'ASC'],
                ['firstname', 'ASC']
            ]
        });

        const sanitized = employees.map(emp => sanitizeEmployee(emp));
        res.send(sanitized);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving employees."
        });
    }
}

// Create a new Admin user
exports.createAdmin = async (req, res) => {
    console.log('--- New createAdmin request ---');
    
    const hasAuthHeader = req.headers && req.headers.authorization;
    let callerCompanyId = null;

    // Authentication and getting caller's company_id
    if (hasAuthHeader) {
        const decoded = ensureAuthenticated(req, res);
        if (!decoded) return;
        const callerRole = (decoded.role || '').toLowerCase();
        callerCompanyId = decoded.company_id; // Get company_id from the authenticated caller

        if (callerRole !== 'admin') return res.status(403).send({ message: 'Forbidden: admin role required' });
    } else {
        // Localhost logic for initial setup
        const ip = req.ip || req.connection.remoteAddress || '';
        if (!(ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1')) {
            return res.status(403).send({ message: 'Forbidden: admin creation allowed only from localhost or by authenticated admin' });
        }
    }

    // Determine company_id for the new Admin
    let adminCompanyId = req.body.company_id || callerCompanyId;

    if (!adminCompanyId) {
        return res.status(400).send({ message: "Company ID is required for the new Admin." });
    }

    // Validation
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        console.log('Validation failed: missing fields');
        res.status(400).send({ message: "Firstname, lastname and email are required!" });
        return;
    }

    try {
        const normalizedEmail = String(req.body.email).toLowerCase();

        // Prevent duplicate accounts
        const existing = await Employee.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            return res.status(409).send({ message: 'An account already exists for this email address' });
        }

        const password = req.body.password || 'password';
        const password_hash = await hashPassword(password);

        const employeePayload = {
            id: await generateNextEmployeeId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: normalizedEmail,
            password_hash: password_hash,
            role: 'admin',
            is_active: true,
            company_id: adminCompanyId 
        };

        const created = await Employee.create(employeePayload);
        console.log('Admin created successfully:', created.email);

        res.status(201).send(sanitizeEmployee(created));
    } catch (err) {
        console.error('Error creating admin:', err);
        res.status(500).send({ message: err.message || "Some error occurred while creating the admin." });
    }
};