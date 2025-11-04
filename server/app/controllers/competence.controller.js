const db = require("../models");
const Competence = db.competences;
const UserTask = db.user_tasks;
const TeamTask = db.team_tasks;
const Employee = db.employees;
const Team = db.teams;
const TeamMember = db.team_members;
const { Op } = require('sequelize');

// Get all competences for a specific employee
exports.findByEmployee = async (req, res) => {
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

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        start_date: c.start_date,
        end_date: c.end_date,
        label: c.label,
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

exports.create = async (req, res) => {
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
            status: 'assigned'
          });
        } else if (member.id.startsWith('t')) {
          // It's a team - add all team members
          const teamMembers = await db.team_members.findAll({
            where: { team_id: member.id }
          });
          
          return Promise.all(teamMembers.map(tm => 
            UserTask.create({
              competence_id: competence.id,
              employee_id: tm.employee_id,
              status: 'assigned'
            })
          ));
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
              status: 'assigned'
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

          // Add all team members
          const teamMembers = await db.team_members.findAll({
            where: { team_id: teamId }
          });
          
          for (const tm of teamMembers) {
            newEmployeeIds.add(tm.employee_id.toString());
            
            if (!currentEmployeeIds.has(tm.employee_id.toString())) {
              // Add new team member
              await UserTask.create({
                competence_id: id,
                employee_id: tm.employee_id,
                status: 'assigned'
              });
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
        member => member.id === `t${teamTask.team_id}`
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

