const db = require('../models');
const { ensureAuthenticated } = require('../authentication/utils');
const nodemailer = require('nodemailer');
const TeamMember = db.team_members;
const Employee = db.employees;
const Team = db.teams;
const TeamTask = db.team_tasks;
const UserTask = db.user_tasks;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        
    pass: process.env.GMAIL_APP_PASSWORD 
  }
});

async function sendTeamAssignmentEmail(toEmail, firstName, teamName, role) {
  try {
    const mailOptions = {
      from: `"HR System" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'Update - New Team Assignment',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${firstName},</h2>
          <p>You have been added to a new team!</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Team:</strong> <span style="color: #0056b3;">${teamName}</span></p>
            <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
          </div>

          <p>You can verify your tasks on your dashboard.</p>
          <br>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="color: #888; font-size: 12px;">This is an automated message.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Team notification email sent: %s', info.messageId);
  } catch (error) {
    console.error("Error sending team email:", error);
  }
}

function getCompanyContext(req, res) {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return null;

    if (!decodedUser.company_id) {
        res.status(400).send({ message: 'Company context missing for current user.' });
        return null;
    }

    return decodedUser;
}

// Create a new Team Member
exports.create = async (req, res) => {
    const decodedUser = getCompanyContext(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;
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
        // Check if team and employee exist inside the caller's company
        const [team, employee] = await Promise.all([
            Team.findOne({ where: { id: req.body.team_id, company_id: callerCompanyId } }),
            Employee.findOne({ where: { id: req.body.employee_id, company_id: callerCompanyId } })
        ]);

        if (!team) {
            res.status(404).send({ message: "Team not found or unauthorized" });
            return;
        }

        if (!employee) {
            res.status(404).send({ message: "Employee not found or unauthorized" });
            return;
        }

        // Check if team member already exists
        const existingMember = await TeamMember.findOne({
            where: {
                team_id: req.body.team_id,
                employee_id: req.body.employee_id
            }
        });

        if (existingMember) {
            res.status(400).send({
                message: "Employee is already a member of this team"
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

        // Return the created team member with basic associated data
        const result = await TeamMember.findOne({
            where: { team_id: req.body.team_id, employee_id: req.body.employee_id },
            include: [
                {
                    model: Team,
                    where: { company_id: callerCompanyId },
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['id', 'firstname', 'lastname', 'email', 'role'],
                    where: { company_id: callerCompanyId },
                    required: true
                }
            ]
        });

        if (result && result.employee && result.team) {
            sendTeamAssignmentEmail(
                result.employee.email, 
                result.employee.firstname, 
                result.team.team_name,
                result.role
            );
        }

        res.send(result);
    } catch (err) {
        console.error('Error creating team member:', err);
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Team Member."
        });
    }
};

exports.findAll = async (req, res) => {
    const decodedUser = getCompanyContext(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;

    try {
        const data = await TeamMember.findAll({
            include: [
                {
                    model: Team,
                    attributes: ['id', 'team_name', 'description'],
                    where: { company_id: callerCompanyId },
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['id', 'firstname', 'lastname', 'email', 'role'],
                    where: { company_id: callerCompanyId },
                    required: true
                }
            ]
        });
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message:
                err.message || "Some error occurred while retrieving team members."
        });
    }
}

// Get all teams for a specific employee
exports.findByEmployee = async (req, res) => {
    const decodedUser = getCompanyContext(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;
    const employeeId = req.params.employeeId;

    try {
        if (!employeeId || !employeeId.match(/^e[0-9]+$/)) {
            return res.status(400).send({
                message: "Invalid employee ID format. Must start with 'e'"
            });
        }

        const employee = await Employee.findOne({ where: { id: employeeId, company_id: callerCompanyId } });
        if (!employee) {
            return res.status(404).send({ message: "Employee not found or unauthorized" });
        }

        const teamMembers = await TeamMember.findAll({
            where: { employee_id: employeeId },
            include: [{
                model: Team,
                attributes: ['id', 'team_name', 'description'],
                where: { company_id: callerCompanyId },
                required: true
            }]
        });

        const teams = teamMembers.map(tm => ({
            id: tm.team?.id,
            name: tm.team?.team_name,
            description: tm.team?.description,
            role: tm.role
        }));

        res.send(teams);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving teams for employee."
        });
    }
};

// Remove an employee from a team
exports.remove = async (req, res) => {
    const decodedUser = getCompanyContext(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;
    const teamId = req.params.teamId;
    const employeeId = req.params.employeeId;

    try {
        // Validate IDs
        if (!teamId || !teamId.match(/^t[0-9]+$/)) {
            return res.status(400).send({
                message: "Invalid team ID format. Must start with 't'"
            });
        }
        if (!employeeId || !employeeId.match(/^e[0-9]+$/)) {
            return res.status(400).send({
                message: "Invalid employee ID format. Must start with 'e'"
            });
        }

        const membership = await TeamMember.findOne({
            where: { team_id: teamId, employee_id: employeeId },
            include: [
                {
                    model: Team,
                    attributes: ['id', 'company_id'],
                    required: true
                },
                {
                    model: Employee,
                    attributes: ['id', 'company_id'],
                    required: true
                }
            ]
        });

        if (!membership) {
            return res.status(404).send({
                message: "Team member relationship not found"
            });
        }

        if (membership.team.company_id !== callerCompanyId || membership.employee.company_id !== callerCompanyId) {
            return res.status(403).send({ message: 'Forbidden: team member is outside your company scope' });
        }

        await membership.destroy();

        res.status(204).send();
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error removing employee from team."
        });
    }
};

// Get all members of a specific team
exports.findByTeam = async (req, res) => {
    const decodedUser = getCompanyContext(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;
    const teamId = req.params.teamId;

    try {
        if (!teamId || !teamId.match(/^t[0-9]+$/)) {
            return res.status(400).send({
                message: "Invalid team ID format. Must start with 't'"
            });
        }

        const team = await Team.findOne({ where: { id: teamId, company_id: callerCompanyId } });
        if (!team) {
            return res.status(404).send({ message: "Team not found or unauthorized" });
        }

        const teamMembers = await TeamMember.findAll({
            where: { team_id: teamId },
            include: [{
                model: Employee,
                attributes: ['id', 'firstname', 'lastname', 'email', 'role'],
                where: { company_id: callerCompanyId },
                required: true
            }]
        });

        const members = teamMembers.map(tm => ({
            id: tm.employee?.id,
            name: `${tm.employee?.firstname} ${tm.employee?.lastname}`,
            email: tm.employee?.email,
            role: tm.role
        }));

        res.send(members);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving members for team."
        });
    }
};