module.exports = (app) => {
  const search = require('../controllers/search.controller.js');
  const router = require('express').Router();
  const { ensureGetAllowed } = require('../authentication/utils.js');


  // GET /api/search/fuzzy?q=term
  router.get('/fuzzy', ensureGetAllowed, search.fuzzy);
  
  // mount router
  app.use('/api/search', router);
};
