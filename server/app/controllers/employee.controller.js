const db = require('../models');
const Employee = db.employees;

// Create a new Employee
exports.create = async (req, res) => {
    // if (!validHRToken(req.token)) {
    //     return res.status(403).send({ message: "Forbidden" });
    // }

    // Validate request
    if (!req.body.firstname || !req.body.lastname || !req.body.email) {
        res.status(400).send({
            message: "Firstname, lastname and email are required!"
        });
        return;
    }

    let password = 'password';
    let password_hash = password;
    //let passwor_hash = createHashedPassword(password);

    // Generate next employee ID
    const generateNextEmployeeId = async () => {
        const lastEmployee = await Employee.findOne({
            order: [['id', 'DESC']]
        });
        if (!lastEmployee) {
            return 'e1';
        }
        const lastNumber = parseInt(lastEmployee.id.substring(1));
        return `e${lastNumber + 1}`;
    };

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
    Employee.create(employee)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Employee."
            });
        });
};

// Retrieve all Employees
exports.findAll = (req, res) => {
    Employee.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving employees."
            });
        });
}