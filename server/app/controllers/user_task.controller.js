const db = require('../models');
const UserTask = db.user_tasks;

exports.findAll = (req, res) => {
    UserTask.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving user tasks."
            });
        });
}

// Employee updates their own task for a competence
exports.updateByEmployee = async (req, res) => {
    const competenceId = req.params.competenceId;

    const employeeId = req.headers['x-employee-id'] || req.headers['x-user-id'];
    const { status, employee_review } = req.body;

    if (!employeeId) {
        return res.status(400).send({ message: 'Employee id is required in header x-employee-id' });
    }

    try {
        const task = await UserTask.findOne({ where: { competence_id: competenceId, employee_id: employeeId } });
        if (!task) return res.status(404).send({ message: 'User task not found' });

        const updates = {};
        if (typeof status !== 'undefined') updates.status = status;
        if (typeof employee_review !== 'undefined') updates.employee_review = employee_review;

        // Employees cannot set hr_review
        await task.update(updates);
        const updated = await UserTask.findOne({ where: { competence_id: competenceId, employee_id: employeeId } });
        res.send(updated);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error updating user task' });
    }
};

// HR updates a user's task (requires HR role)
exports.updateByHR = async (req, res) => {
    const competenceId = req.params.competenceId;
    const employeeId = req.params.employeeId;
    const { status, employee_review, hr_review } = req.body;

    // Simple role check: expect caller role in header 'x-user-role'
    const callerRole = (req.headers['x-user-role'] || '').toLowerCase();
    if (!['hr','rh','admin'].includes(callerRole)) {
        return res.status(403).send({ message: 'Forbidden: HR role required' });
    }

    try {
        const task = await UserTask.findOne({ where: { competence_id: competenceId, employee_id: employeeId } });
        if (!task) return res.status(404).send({ message: 'User task not found' });

        const updates = {};
        if (typeof status !== 'undefined') updates.status = status;
        if (typeof employee_review !== 'undefined') updates.employee_review = employee_review;
        if (typeof hr_review !== 'undefined') updates.hr_review = hr_review;

        await task.update(updates);
        const updated = await UserTask.findOne({ where: { competence_id: competenceId, employee_id: employeeId } });
        res.send(updated);
    } catch (err) {
        res.status(500).send({ message: err.message || 'Error updating user task' });
    }
};