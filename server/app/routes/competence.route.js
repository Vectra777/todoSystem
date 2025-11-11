module.exports = (app) => {
    const competence = require('../controllers/competence.controller.js');
    const router = require('express').Router();
    const { ensureGetAllowed } = require('../authentication/utils.js');

    // Create a new Competence
    router.post('/', competence.create);

    // Get all Competences
    router.get('/', ensureGetAllowed, competence.findAll);

    // Get competences for a specific employee (owner or HR/Admin)
    const { ensureSelfOrHrOrAdmin } = require('../authentication/utils.js');
    router.get('/employee/:employeeId', ensureSelfOrHrOrAdmin, competence.findByEmployee);

    // Get competences for a specific team with progress
    router.get('/team/:teamId', ensureGetAllowed, competence.findByTeam);

    // Get progress percentage for a specific competence
    router.get('/:id/progress', ensureGetAllowed, competence.getProgress);

    // Update a Competence
    router.put('/:id', ensureGetAllowed, competence.update);

    // Delete a Competence
    router.delete('/:id', ensureGetAllowed, competence.delete);

    app.use('/api/competence', router);
}