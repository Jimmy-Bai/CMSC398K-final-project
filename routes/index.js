const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../public/js/auth');

// Load in data base
const UserProfile = require('../db/UserProfile');
const Island = require('../db/Island');

module.exports = function (io) {
  // Homepage
  router.get('/', forwardAuthenticated, function (req, res) {
    res.render('home');
  });

  // About page
  router.get('/about', function (req, res) {
    res.render('about');
  });

  // Dashboard page
  router.get('/dashboard', ensureAuthenticated, function (req, res) {
    // Render all islands in the order they are added
    Island.find({})
      .then((IslandProfileList) => {
        res.render('dashboard', {
          uuid: req.user.uuid,
          island_profile_list: IslandProfileList.reverse()
        });
      });
  });

  // User profile page 
  router.get('/dashboard/profile/:uuid', ensureAuthenticated, function (req, res) {
    const _uuid = req.params.uuid;
    let isForeignUser = false;
    let activeHostIslandList = [];
    let inactiveHostIslandList = [];
    let visitedIslandList = [];
    let visitedIslandListLeft = [];
    let visitedIslandListRight = [];
    let updatedVisitedIslandList = [];

    // Check if current user has access to current profile
    if (_uuid != req.user.uuid) {
      isForeignUser = true;
    }

    // Get user profile base on _uuid
    UserProfile.findOne({ uuid: _uuid })
      .then((userProfile) => {
        // If user profile is found with the given uuid,
        // Render profile with the appropriate authentication
        // Else render error page
        if (userProfile) {
          console.log(`Profile with uuid ${_uuid} is found.`);

          // Get all islands in host_island_list and visited_island
          Island.find({})
            .then((IslandProfileList) => {
              // Separate host island into active and inactive 
              IslandProfileList.forEach((IslandProfile) => {
                if (userProfile.host_island_list.includes(IslandProfile.island_uuid)) {
                  if (IslandProfile.active) {
                    activeHostIslandList.push(IslandProfile);
                  } else {
                    inactiveHostIslandList.push(IslandProfile);
                  }
                } else if (userProfile.visit_island_list.includes(IslandProfile.island_uuid)) {
                  visitedIslandList.push(IslandProfile);
                  updatedVisitedIslandList.push(IslandProfile.island_uuid);
                }
              });

              // Update visited island list
              userProfile.visit_island_list = updatedVisitedIslandList;
              userProfile.island_visited = updatedVisitedIslandList.length;

              userProfile.save()
                .then((ResultProfile) => {
                  // Separate visited list into two halves
                  const middle = Math.ceil(visitedIslandList.length / 2);
                  visitedIslandListLeft = visitedIslandList.splice(0, middle);
                  visitedIslandListRight = visitedIslandList;

                  // Render profile page
                  res.render('profile', {
                    uuid: req.user.uuid,
                    target_uuid: _uuid,
                    found: true,
                    isForeignUser: isForeignUser,
                    username: ResultProfile.username,
                    island_hosted: ResultProfile.island_hosted,
                    island_visited: ResultProfile.island_visited,
                    active_island_list: activeHostIslandList,
                    inactive_island_list: inactiveHostIslandList,
                    visited_island_list_l: visitedIslandListLeft,
                    visited_island_list_r: visitedIslandListRight
                  });
                });
            });
        } else {
          console.log(`ERROR. Profile with uuid ${_uuid} is NOT found.`);
          res.render('profile', {
            uuid: req.user.uuid,
            found: false
          });
        }
      });
  });

  // DELETE end point for all islands
  // Delete all islands hosted by user
  router.delete('/dashboard/profile/deleteAll/:uuid', ensureAuthenticated, function (req, res) {
    const _uuid = req.body.uuid;

    UserProfile.findOne({ uuid: _uuid })
      .then((Profile) => {
        // Get the list of island for user
        const host_island_list = Profile.host_island_list;

        if (host_island_list.length > 0) {
          // Delete all island from Island data base
          Island.deleteMany({
            island_uuid: {
              $in: host_island_list
            }
          }, function (error) {
            if (error) throw error;

            // Save an empty list to the user profile
            // Set number of island hosted to 0
            Profile.host_island_list = [];
            Profile.island_hosted = 0;
            Profile.save()
              .then((ResultProfile) => {
                res.send('Success');
              });
          });
        } else {
          res.send('No active or inactive islands.');
        }
      });
  });

  // DELETE end point for inactive islands
  router.delete('/dashboard/profile/deleteInactive/:uuid', ensureAuthenticated, async function (req, res) {
    const _uuid = req.body.uuid;
    const _UserProfile = await UserProfile.findOne({ uuid: _uuid });
    const host_island_list = _UserProfile.host_island_list;
    let inactive_island_list = [];
    let active_island_list = [];

    // Get a list of inactive island 
    for await (const _island_uuid of host_island_list) {
      const IslandProfile = await Island.findOne({ island_uuid: _island_uuid });
      // If island is inactive, push to list 
      if (!IslandProfile.active) {
        inactive_island_list.push(_island_uuid);
      } else {
        active_island_list.push(_island_uuid);
      }
    }

    // Delete all inactive island from Island data base
    if (inactive_island_list.length > 0) {
      Island.deleteMany({
        island_uuid: {
          $in: inactive_island_list
        }
      }, function (error) {
        if (error) throw error;

        // Save an empty list to the user profile
        // Set number of island hosted to 0
        _UserProfile.host_island_list = active_island_list;
        _UserProfile.island_hosted = _UserProfile.island_hosted - inactive_island_list.length;
        _UserProfile.save()
          .then((ResultProfile) => {
            res.send('Success');
          });
      });
    } else {
      res.send('No inactive islands.');
    }

  });

  // POST end point for clearing visited islands history
  router.post('/dashboard/profile/deleteVisited/:uuid', ensureAuthenticated, function (req, res) {
    const _uuid = req.body.uuid;

    UserProfile.findOne({ uuid: _uuid })
      .then((Profile) => {
        Profile.visit_island_list = [];
        Profile.island_visited = 0;

        Profile.save()
        .then((ResultProfile) => {
          if (ResultProfile) {
            res.send('Success');
          }
        })
      });
  });

  // Setting up /island socket.io server
  io.of('/profile').on('connection', function (socket) {
    // Debug
    console.log('Socket is in profile.');
  });

  return router;
};