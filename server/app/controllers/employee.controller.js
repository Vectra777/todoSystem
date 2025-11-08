const db = require('../models');
const { ensureAuthenticated, hashPassword } = require('../authentication/utils');
const Employee = db.employees;

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
    const callerRole = (req.user?.role || '').toLowerCase();
    if (!HR_ROLES.includes(callerRole)) {
        return res.status(403).send({ message: 'Forbidden: HR role required' });
    }

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
        const employee = {
            id: await generateNextEmployeeId(),
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password_hash: password_hash,
            role: req.body.role || 'employee',
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