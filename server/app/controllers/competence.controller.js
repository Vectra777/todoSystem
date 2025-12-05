const db = require("../models");
const { ensureAuthenticated } = require('../authentication/utils');
const nodemailer = require('nodemailer');
const Competence = db.competences;
const UserTask = db.user_tasks;
const TeamTask = db.team_tasks;
const Employee = db.employees;
const Team = db.teams;
const TeamMember = db.team_members;
const File = db.files;
const { Op } = require('sequelize');
const { marked } = require('marked');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        
    pass: process.env.GMAIL_APP_PASSWORD 
  }
});

// --- READ/SEARCH FUNCTIONS ---

// Get all competences for a specific employee
exports.findByEmployee = async (req, res) => {
  const decodedUser = ensureAuthenticated(req, res);
  if (!decodedUser) return;
  // Retrieve the company ID from the authenticated user
  const callerCompanyId = decodedUser.company_id; 

  const employeeId = req.params.employeeId;

  try {
    if (!employeeId || !employeeId.match(/^e[0-9]+$/)) {
      return res.status(400).send({
        message: "Invalid employee ID format. Must start with 'e'"
      });
    }

    // Fetch competences including the employee through data
    const competences = await Competence.findAll({
      // FILTER BY company_id
      where: { company_id: callerCompanyId }, 
      include: [{
        model: Employee,
        required: true,
        through: {
          model: UserTask,
          where: { employee_id: employeeId },
          attributes: ['status', 'employee_review', 'hr_review']
        },
        attributes: ['id', 'firstname', 'lastname']
      }]
    });

    const result = competences
      .filter(c => c.employees && c.employees.length > 0)
      .map(c => {
        const emp = c.employees[0];
        const throughData = emp && (emp.user_tasks || emp.user_task || emp.user_taskses) || null;

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          start_date: c.start_date,
          end_date: c.end_date,
          label: c.label,
          status: throughData?.status || null,
          employee_review: throughData?.employee_review || null,
          hr_review: throughData?.hr_review || throughData?.h_r_review || null
        };
      });

    res.send(result);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error retrieving competences for employee."
    });
  }
};

// Get all competences for a team with progress percentage
exports.findByTeam = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    // Retrieve the company ID from the authenticated user
    const callerCompanyId = decodedUser.company_id;
    
    const teamId = req.params.teamId;

    try {
        if (!teamId || !teamId.match(/^t[0-9]+$/)) {
            return res.status(400).send({
                message: "Invalid team ID format. Must start with 't'"
            });
        }

        // Get all team members
        const teamMembers = await TeamMember.findAll({
            where: { team_id: teamId },
            attributes: ['employee_id']
        });

        const employeeIds = teamMembers.map(tm => tm.employee_id);

        // Get all team competences with employee statuses
        const competences = await Competence.findAll({
            // FILTER BY company_id
            where: { company_id: callerCompanyId },
            include: [
                {
                    model: Team,
                    where: { id: teamId },
                    through: TeamTask,
                    attributes: ['team_name']
                },
                {
                    model: Employee,
                    through: {
                        model: UserTask,
                        where: { 
                            employee_id: { [Op.in]: employeeIds }
                        },
                        attributes: ['status']
                    },
                    attributes: ['id', 'firstname', 'lastname']
                }
            ]
        });

        const result = competences.map(competence => {
            const totalMembers = employeeIds.length;
            const statuses = competence.employees.map(emp => emp.user_tasks.status);
            
            const completedCount = statuses.filter(status => status === 'Completed').length;
            const inProgressCount = statuses.filter(status => status === 'In Progress').length;
            
            const progressPercentage = (
                (completedCount * 100 + inProgressCount * 50) / (totalMembers * 100)
            ) * 100;

            return {
                id: competence.id,
                title: competence.title,
                description: competence.description,
                start_date: competence.start_date,
                end_date: competence.end_date,
                label: competence.label,
                team_name: competence.teams[0].team_name,
                progress_percentage: Math.round(progressPercentage),
                members: competence.employees.map(emp => ({
                    id: emp.id,
                    firstname: emp.firstname,
                    lastname: emp.lastname,
                    status: emp.user_tasks.status
                }))
            };
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error retrieving competences for team."
        });
    }
};

exports.findAll = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    // Retrieve the company ID from the authenticated user
    const callerCompanyId = decodedUser.company_id;
    
    try {
        const competences = await Competence.findAll({
            // FILTER BY company_id
            where: { company_id: callerCompanyId },
            include: [
                {
                    model: Employee,
                    through: {
                        model: UserTask,
                        attributes: ['status', 'employee_review', 'hr_review']
                    },
                    attributes: ['id', 'firstname', 'lastname']
                },
                {
                    model: Team,
                    through: {
                        model: TeamTask,
                    },
                    attributes: ['id', 'team_name', 'description']
                }
            ]
        });

        const result = competences.map(c => {
            const members = (c.employees || []).map(emp => {
                const throughData = emp.user_tasks || emp.user_taskses || null;
                return {
                    id: emp.id,
                    firstname: emp.firstname,
                    lastname: emp.lastname,
                    status: throughData?.status || null,
                    employee_review: throughData?.employee_review || null,
                    hr_review: throughData?.hr_review || null
                };
            });

            const teams = (c.teams || []).map(team => {
                const teamThrough = team.team_tasks && team.team_tasks[0] ? team.team_tasks[0] : team.team_task || null;
                return {
                    id: team.id,
                    team_name: team.team_name,
                    description: team.description,
                    assigned_at: teamThrough?.created_at || null,
                    start_date: teamThrough?.start_date || null,
                    end_date: teamThrough?.end_date || null
                };
            });

            const statusValues = {
                'To Do': 0,
                'In Progress': 0.5,
                'Completed': 1,
                'Validated': 1
            };

            let totalProgress = 0;
            members.forEach(member => {
                const progressValue = statusValues[member.status] || 0;
                totalProgress += progressValue;
            });

            const progress = members.length > 0 ? Math.round((totalProgress / members.length) * 100) : 0;

            return {
                id: c.id,
                title: c.title,
                description: c.description,
                start_date: c.start_date,
                end_date: c.end_date,
                label: c.label,
                progress: progress,
                members,
                teams
            };
        });

        res.send(result);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving competences.",
        });
    }
};

// Get progress percentage for a specific competence
exports.getProgress = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    // Retrieve the company ID from the authenticated user
    const callerCompanyId = decodedUser.company_id;
    
    try {
        const id = req.params.id;

        // Get the competence with all assigned employees
        const competence = await Competence.findByPk(id, {
            // ADD company_id filter for security and isolation
            where: { company_id: callerCompanyId }, 
            include: [{
                model: Employee,
                through: {
                    model: UserTask,
                    attributes: ['status']
                },
                attributes: ['id', 'firstname', 'lastname']
            }]
        });

        if (!competence) {
            // Not found OR belongs to a different company
            return res.status(404).send({ 
                message: `Competence with id ${id} not found or unauthorized.`
            });
        }

        const members = competence.employees || [];
        
        if (members.length === 0) {
            return res.send({
                competence_id: id,
                progress: 0,
                total_members: 0,
                members: []
            });
        }

        const statusValues = {
            'To Do': 0,
            'In Progress': 0.5,
            'Completed': 1,
            'Validated': 1
        };

        let totalProgress = 0;
        const memberProgress = members.map(emp => {
            const throughData = emp.user_tasks || emp.user_taskses || null;
            const status = throughData?.status || 'To Do';
            const progressValue = statusValues[status] || 0;
            totalProgress += progressValue;
            
            return {
                id: emp.id,
                name: `${emp.firstname} ${emp.lastname}`,
                status: status,
                progress: progressValue
            };
        });

        const percentage = (totalProgress / members.length) * 100;

        res.send({
            competence_id: id,
            progress: Math.round(percentage * 10) / 10,
            total_members: members.length,
            completed_count: memberProgress.filter(m => m.progress === 1).length,
            in_progress_count: memberProgress.filter(m => m.progress === 0.5).length,
            todo_count: memberProgress.filter(m => m.progress === 0).length,
            members: memberProgress
        });

    } catch (err) {
        res.status(500).send({
            message: err.message || "Error calculating competence progress."
        });
    }
};

async function sendTaskNotificationEmail(toEmail, firstName, taskTitle, description) {
  try {
    const descriptionHtml = description ? marked.parse(description) : 'No description provided.';
    const mailOptions = {
      from: `"Task Manager" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: 'New Task Assigned',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${firstName},</h2>
          <p>A new competence has been assigned to you.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h3 style="margin-top: 0;">${taskTitle}</h3>
            <div style="color: #555;">
              ${descriptionHtml}
            </div>
          </div>

          <p>Please check your dashboard for more details.</p>
          <br>
          <p style="color: #888; font-size: 12px;">Automated notification.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Task notification sent to %s (%s)', toEmail, info.messageId);
  } catch (error) {
    console.error("Error sending task email:", error);
  }
}

// --- WRITE/MODIFY FUNCTIONS ---

exports.create = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    const callerCompanyId = decodedUser.company_id;
    
    try {
        if (!req.body.title) {
            res.status(400).send({ message: "Title is required!" });
            return;
        }

        const competence = await Competence.create({
            title: req.body.title,
            description: req.body.description || "",
            start_date: req.body.start_date || null,
            end_date: req.body.end_date || null,
            label: req.body.label || "",
            company_id: callerCompanyId
        });

        if (req.body.members && Array.isArray(req.body.members)) {
            
            const notifiedEmails = new Set();

            for (const member of req.body.members) {
                
                if (member.id.startsWith('e')) {
                    await UserTask.create({
                        competence_id: competence.id,
                        employee_id: member.id,
                        status: 'To Do'
                    });

                    const employee = await Employee.findByPk(member.id);
                    if (employee && employee.email) {
                        const email = employee.email.toLowerCase();
                        
                        if (!notifiedEmails.has(email)) {
                            await sendTaskNotificationEmail(
                                employee.email, 
                                employee.firstname, 
                                competence.title, 
                                competence.description
                            );
                            notifiedEmails.add(email);
                        }
                    }

                } else if (member.id.startsWith('t')) {
                    await TeamTask.create({
                        team_id: member.id,
                        competence_id: competence.id
                    });
                    

                    const teamMembers = await TeamMember.findAll({
                        where: { team_id: member.id },
                        include: [{
                            model: Employee,
                            attributes: ['id', 'firstname', 'email']
                        }]
                    });

                    for (const tm of teamMembers) {
                        if (tm.employee && tm.employee.email) {
                            const email = tm.employee.email.toLowerCase();

                            if (!notifiedEmails.has(email)) {

                                await UserTask.create({
                                    competence_id: competence.id,      
                                    employee_id: tm.employee.id,        
                                    status: 'To Do'
                                });

                                await sendTaskNotificationEmail(
                                    tm.employee.email, 
                                    tm.employee.firstname, 
                                    competence.title, 
                                    competence.description
                                );
                                notifiedEmails.add(email);
                            }
                        }
                    }
                }
            }
        }
        
        const result = await Competence.findByPk(competence.id, {
            include: [{
                model: Employee,
                through: {
                    model: UserTask,
                    attributes: ['status']
                },
                attributes: ['id', 'firstname', 'lastname']
            }]
        });

        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Competence.",
        });
    }
};

// Update a Competence
exports.update = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    // Retrieve the company ID from the authenticated user
    const callerCompanyId = decodedUser.company_id;
    
    try {
        const id = req.params.id;
        const notifiedEmails = new Set();
        
        // AUTH CHECK: Verify ownership before updating
        const existingCompetence = await Competence.findByPk(id);
        if (!existingCompetence || existingCompetence.company_id !== callerCompanyId) {
             return res.status(404).send({ 
                message: `Competence with id ${id} not found or unauthorized to update.`
            });
        }
        
        // Update basic competence info
        await Competence.update({
            title: req.body.title,
            description: req.body.description,
            start_date: req.body.start_date,
            end_date: req.body.end_date,
            label: req.body.label
        }, {
            where: { id: id, company_id: callerCompanyId } // Double check company_id in WHERE clause
        });

        
        // Get current user tasks
        const currentTasks = await UserTask.findAll({
            where: { competence_id: id }
        });

        // Create sets for efficient lookup
        const currentEmployeeIds = new Set(currentTasks.map(task => task.employee_id.toString()));
        const newEmployeeIds = new Set();

        // Process new members
        if (req.body.members && Array.isArray(req.body.members)) {
            for (const member of req.body.members) {
                if (member.id.startsWith('e')) {
                    const employeeId = member.id;
                    newEmployeeIds.add(employeeId);
                    
                    if (!currentEmployeeIds.has(employeeId)) {
                        await UserTask.create({
                            competence_id: id,
                            employee_id: employeeId,
                            status: 'To Do'
                        });
                    }
               } else if (member.id.startsWith('t')) {
                    const teamId = member.id;
                    
                    await TeamTask.findOrCreate({
                        where: {
                            team_id: teamId,
                            competence_id: id 
                        }
                    });

                    const teamMembers = await TeamMember.findAll({
                        where: { team_id: teamId },
                        include: [{
                            model: Employee,
                            attributes: ['id', 'firstname', 'email']
                        }]
                    });

                    for (const tm of teamMembers) {
                        if (tm.employee && tm.employee.email) {
                            const email = tm.employee.email.toLowerCase();

                            if (!notifiedEmails.has(email)) {
                                
                                await UserTask.create({
                                    competence_id: id,
                                    employee_id: tm.employee.id,
                                    status: 'To Do'
                                });

                                await sendTaskNotificationEmail(
                                    tm.employee.email, 
                                    tm.employee.firstname, 
                                    existingCompetence.title, 
                                    existingCompetence.description
                                );

                                notifiedEmails.add(email);
                            }
                        }
                    }
                }
            }
        }

        // Get current team tasks
        const currentTeamTasks = await TeamTask.findAll({
            where: { competence_id: id }
        });

        // Remove team tasks that are no longer in the list
        for (const teamTask of currentTeamTasks) {
            const teamStillAssigned = req.body.members?.some(
                member => member.id === teamTask.team_id
            );
            
            if (!teamStillAssigned) {
                await TeamTask.destroy({
                    where: {
                        competence_id: id,
                        team_id: teamTask.team_id
                    }
                });
            }
        }

        // Remove members that are no longer in the list
        for (const currentEmployeeId of currentEmployeeIds) {
            if (!newEmployeeIds.has(currentEmployeeId)) {
                await UserTask.destroy({
                    where: {
                        competence_id: id,
                        employee_id: currentEmployeeId
                    }
                });
            }
        }

        // Fetch and return updated competence with members
        const result = await Competence.findByPk(id, {
            include: [{
                model: Employee,
                through: {
                    model: UserTask,
                    attributes: ['status']
                },
                attributes: ['id', 'firstname', 'lastname']
            }]
        });

        if (!result) {
            return res.status(404).send({
                message: `Competence with id ${id} not found.`
            });
        }

        res.send(result);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error updating Competence."
        });
    }
};

// Delete a Competence
exports.delete = async (req, res) => {
    const decodedUser = ensureAuthenticated(req, res);
    if (!decodedUser) return;
    // Retrieve the company ID from the authenticated user
    const callerCompanyId = decodedUser.company_id;
    
    try {
        const id = req.params.id;

        // AUTH CHECK: Verify existence and ownership
        const competenceToDelete = await Competence.findByPk(id);
        if (!competenceToDelete || competenceToDelete.company_id !== callerCompanyId) {
             return res.status(404).send({ 
                message: `Competence with id ${id} not found or unauthorized to delete.`
            });
        }

        // First delete related files
        await File.destroy({ where: { competence_id: id } });

        // Delete related user tasks
        await UserTask.destroy({ where: { competence_id: id } });

        // Delete related team tasks
        await TeamTask.destroy({ where: { competence_id: id } });

        // Then delete the competence, ensuring it belongs to the company
        const deleted = await Competence.destroy({
            where: { id: id, company_id: callerCompanyId }
        });

        if (deleted === 0) {
            return res.status(404).send({
                message: `Competence with id ${id} not found.`
            });
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).send({
            message: err.message || "Error deleting Competence."
        });
    }
};