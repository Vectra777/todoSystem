const db = require('../models');
const { ensureAuthenticated } = require('../authentication/utils');
const Team = db.teams;

// Generate next team ID
const generateNextTeamId = async () => {
    const lastTeam = await Team.findOne({
        order: [['id', 'DESC']]
    });
    if (!lastTeam) {
        return 't1';
    }
    const lastNumber = parseInt(lastTeam.id.substring(1));
    return `t${lastNumber + 1}`;
};

// Create a new Team
exports.create = async (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    // Validate request
    if (!req.body.team_name) {
        res.status(400).send({
            message: "Team name is required!"
        });
        return;
    }

    // Create a Team
    const team = {
        id: await generateNextTeamId(),
        team_name: req.body.team_name,
        description: req.body.description
    };

    // Save Team in the database
    try {
        const data = await Team.create(team);
        res.send(data);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Team."
        });
    }
};

exports.findAll = (req, res) => {
    if (!ensureAuthenticated(req, res)) return;
    Team.findAll()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving teams."
            });
        });
}