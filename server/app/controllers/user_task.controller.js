const db = require('../models');
const nodemailer = require('nodemailer');
const { ensureAuthenticated } = require('../authentication/utils');
const UserTask = db.user_tasks;
const Employee = db.employees; 
const Competence = db.competences;
const HR_ROLES = ['hr', 'rh', 'admin'];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,        
    pass: process.env.GMAIL_APP_PASSWORD 
  }
});

async function sendHRUpdateEmail(toEmail, firstName, taskTitle, status, hrReview) {
  try {
    // Si pas de review, on met un texte par défaut
    const reviewHtml = hrReview 
      ? `<div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0;">
           <strong>HR Comment:</strong><br/>
           <em style="color: #555;">"${hrReview}"</em>
         </div>`
      : '';

    const mailOptions = {
      from: `"HR System" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `Update on task: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${firstName},</h2>
          <p>HR has updated the status or added a review to one of your competences.</p>
          
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>New Status:</strong> <span style="font-weight:bold; color:#0056b3;">${status}</span></p>
          
          ${reviewHtml}

          <p>Please check your dashboard for full details.</p>
          <br>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="color: #888; font-size: 12px;">Automated notification.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('HR Update email sent to %s (%s)', toEmail, info.messageId);
  } catch (error) {
    console.error("Error sending HR update email:", error);
  }
}

exports.findAll = (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
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
    if (!ensureAuthenticated(req, res)) return;
    const competenceId = req.params.competenceId;
    const employeeId = req.user?.id;
    const { status, employee_review } = req.body;

    if (!employeeId) {
        return res.status(403).send({ message: 'Forbidden: invalid authentication context' });
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

/// HR updates a user's task (requires HR role)
exports.updateByHR = async (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    const competenceId = req.params.competenceId;
    const employeeId = req.params.employeeId;
    const { status, employee_review, hr_review } = req.body;

    const callerRole = (req.user?.role || '').toLowerCase();
    if (!HR_ROLES.includes(callerRole)) {
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

        const updatedTask = await UserTask.findOne({ 
            where: { competence_id: competenceId, employee_id: employeeId },
            include: [
                {
                    model: Employee,
                    attributes: ['id', 'firstname', 'lastname', 'email']
                },
                {
                    model: Competence,
                    attributes: ['id', 'title']
                }
            ]
        });

        if (updatedTask && updatedTask.employee && updatedTask.employee.email) {
            
            const currentHrReview = (typeof hr_review !== 'undefined') ? hr_review : updatedTask.hr_review;
            
            sendHRUpdateEmail(
                updatedTask.employee.email,
                updatedTask.employee.firstname,
                updatedTask.competence ? updatedTask.competence.title : 'Unknown Task',
                updatedTask.status,
                currentHrReview
            );
        }

        res.send(updatedTask);
    } catch (err) {
        console.error("Update HR Error:", err);
        res.status(500).send({ message: err.message || 'Error updating user task' });
    }
};