module.exports = (app) => {
  const search = require('../controllers/search.controller.js');
  const router = require('express').Router();


  // GET /api/search/fuzzy?q=term
  router.get('/fuzzy', search.fuzzy);
  
  // mount router
  app.use('/api/search', router);
};
