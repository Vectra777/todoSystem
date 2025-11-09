const db = require("../models");
const { ensureAuthenticated } = require('../authentication/utils');
const Competence = db.competences;
const UserTask = db.user_tasks;
const TeamTask = db.team_tasks;
const Employee = db.employees;
const Team = db.teams;
const TeamMember = db.team_members;
const File = db.files;
const { Op } = require('sequelize');

// Get all competences for a specific employee
exports.findByEmployee = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;
  const employeeId = req.params.employeeId;

  try {
    if (!employeeId || !employeeId.match(/^e[0-9]+$/)) {
      return res.status(400).send({
        message: "Invalid employee ID format. Must start with 'e'"
      });
    }

    // Fetch competences including the employee through data
    const competences = await Competence.findAll({
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

    // Only keep competences that have the employee joined 
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
  if (!ensureAuthenticated(req, res)) return;
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

        // Calculate progress percentage for each competence
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
  if (!ensureAuthenticated(req, res)) return;
  try {
    const competences = await Competence.findAll({
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
            attributes: ['created_at', 'start_date', 'end_date']
          },
          attributes: ['id', 'team_name', 'description']
        }
      ]
    });

    // Normalize response: for each competence return members and teams arrays
    const result = competences.map(c => {
      const members = (c.employees || []).map(emp => {
        // through data should be available as emp.user_tasks (singular) depending on association
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
        // through data for team association
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

      // Calculate progress: To Do = 0, In Progress = 0.5, Completed = 1
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
  if (!ensureAuthenticated(req, res)) return;
  
  try {
    const id = req.params.id;

    // Get the competence with all assigned employees
    const competence = await Competence.findByPk(id, {
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
      return res.status(404).send({
        message: `Competence with id ${id} not found.`
      });
    }

    // Get all member statuses
    const members = competence.employees || [];
    
    if (members.length === 0) {
      return res.send({
        competence_id: id,
        progress: 0,
        total_members: 0,
        members: []
      });
    }

    // Calculate progress: To Do = 0, In Progress = 0.5, Completed = 1
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

    // Calculate percentage (0-100)
    const percentage = (totalProgress / members.length) * 100;

    res.send({
      competence_id: id,
      progress: Math.round(percentage * 10) / 10, // Round to 1 decimal place
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

exports.create = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;
  try {
    // Validate request
    if (!req.body.title) {
      res.status(400).send({
        message: "Title is required!",
      });
      return;
    }

    // Create a Competence
    const competence = await Competence.create({
      title: req.body.title,
      description: req.body.description || "",
      start_date: req.body.start_date || null,
      end_date: req.body.end_date || null,
      label: req.body.label || "",
    });

    // Process members if any
    if (req.body.members && Array.isArray(req.body.members)) {
      const memberPromises = req.body.members.map(async (member) => {
        if (member.id.startsWith('e')) {
          // It's an individual employee
          await UserTask.create({
            competence_id: competence.id,
            employee_id: member.id,
            status: 'To Do'
          });
        } else if (member.id.startsWith('t')) {
          // It's a team - only create the TeamTask relationship
          await TeamTask.create({
            team_id: member.id,
            competence_id: competence.id
          });
          // Note: We don't automatically create UserTasks for all team members
          // UserTasks are only for individually assigned employees
        }
      });

      await Promise.all(memberPromises);
    }

    // Fetch the created competence with its members
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
    res.status(500).send({
      message: err.message || "Some error occurred while creating the Competence.",
    });
  }
};

// Update a Competence
exports.update = async (req, res) => {
  if (!ensureAuthenticated(req, res)) return;
  try {
    const id = req.params.id;

    // Update basic competence info
    await Competence.update({
      title: req.body.title,
      description: req.body.description,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      label: req.body.label
    }, {
      where: { id: id }
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
          // Individual employee
          const employeeId = member.id;
          newEmployeeIds.add(employeeId);
          
          if (!currentEmployeeIds.has(employeeId)) {
            // Add new member
            await UserTask.create({
              competence_id: id,
              employee_id: employeeId,
              status: 'To Do'
            });
          }
        } else if (member.id.startsWith('t')) {
          const teamId = member.id;
          
          // Create or update team_task entry
          await TeamTask.findOrCreate({
            where: {
              team_id: teamId,
              competence_id: id
            }
          });
          // Note: We don't automatically create UserTasks for all team members
          // UserTasks are only for individually assigned employees
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
  if (!ensureAuthenticated(req, res)) return;
  try {
    const id = req.params.id;

    // First delete related files
    await File.destroy({
      where: { competence_id: id }
    });

    // Delete related user tasks
    await UserTask.destroy({
      where: { competence_id: id }
    });

    // Delete related team tasks
    await TeamTask.destroy({
      where: { competence_id: id }
    });

    // Then delete the competence
    const deleted = await Competence.destroy({
      where: { id: id }
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
