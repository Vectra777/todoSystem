const db = require('../models');
const { ensureAuthenticated } = require('../authentication/utils');
const TeamMember = db.team_members;
const Employee = db.employees;
const Team = db.teams;
const TeamTask = db.team_tasks;
const UserTask = db.user_tasks;

// Create a new Team Member
exports.create = async (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    // Validate request
    if (!req.body.team_id || !req.body.employee_id || !req.body.role) {
        res.status(400).send({
            message: "Team ID, Employee ID and role are required!"
        });
        return;
    }

    // Verify that team_id and employee_id exist and follow the correct format
    if (!req.body.team_id.match(/^t[0-9]+$/i) || !req.body.employee_id.match(/^e[0-9]+$/i)) {
        res.status(400).send({
            message: "Invalid team_id or employee_id format. Team ID should start with 't' and Employee ID with 'e'"
        });
        return;
    }

    try {
        // Check if team and employee exist
        const team = await Team.findByPk(req.body.team_id);
        const employee = await Employee.findByPk(req.body.employee_id);

        if (!team || !employee) {
            res.status(404).send({
                message: "Team or Employee not found"
            });
            return;
        }

        // Create Team Member
        const teamMember = {
            team_id: req.body.team_id,
            employee_id: req.body.employee_id,
            role: req.body.role
        };

        // Create Team Member
        const data = await TeamMember.create(teamMember);

        // Get all team tasks
        const teamTasks = await TeamTask.findAll({
            where: { team_id: req.body.team_id }
        });

        // Create user tasks for each team task
        const userTaskPromises = teamTasks.map(async (teamTask) => {
            // Check if user task already exists
            const existingTask = await UserTask.findOne({
                where: {
                    competence_id: teamTask.competence_id,
                    employee_id: req.body.employee_id
                }
            });

            // Only create if it doesn't exist
            if (!existingTask) {
                return UserTask.create({
                    competence_id: teamTask.competence_id,
                    employee_id: req.body.employee_id,
                    status: 'To Do'
                });
            }
        });

        await Promise.all(userTaskPromises);

        // Return the created team member with associated tasks
        const result = await TeamMember.findOne({
            where: { team_id: req.body.team_id, employee_id: req.body.employee_id },
            include: [
                {
                    model: Team,
                    include: [{
                        model: TeamTask,
                        include: [{
                            model: UserTask,
                            where: { employee_id: req.body.employee_id },
                            required: false
                        }]
                    }]
                }
            ]
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Team Member."
        });
    }
};

exports.findAll = (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    TeamMember.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving team members."
            });
        });
}