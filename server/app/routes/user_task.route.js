module.exports = (app) => {
    const user_task = require('../controllers/user_task.controller.js');
    const router = require('express').Router();

    router.get('/', user_task.findAll);

    // Employee updates their own task (provide x-employee-id header)
    router.put('/me/:competenceId', user_task.updateByEmployee);

    // HR updates a user's task (provide x-user-role: hr)
    router.put('/:competenceId/:employeeId', user_task.updateByHR);

    app.use('/api/user_task', router);
}