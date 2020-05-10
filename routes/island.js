const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../public/js/auth');

// Load in data base
const UserProfile = require('../db/UserProfile');
const Island = require('../db/Island');

// Load local js file
const AppUtil = require('../public/js/app-util');

module.exports = function (io) {
  // Island information page
  router.get('/:island_uuid', ensureAuthenticated, function (req, res) {
    const _islandUuid = req.params.island_uuid;
    let isHost = false;
    let inQueue = false;
    let inQueueBefore = false;
    let isFullQueue = false;
    let currentTurn = false;
    let currentPlace = 0;
    let hostName = '';

    // Get island information
    Island.findOne({ island_uuid: _islandUuid })
      .then((Island) => {
        if (Island) {
          // Check if current user is host
          if (Island.host_uuid == req.user.uuid) {
            isHost = true;
          }

          // Check if current user is in queue
          // If yes, get the place user is in
          if ((currentPlace = Island.queue_list.findIndex((user) => user.uuid === parseInt(req.user.uuid))) >= 0) {
            inQueue = true;
          }

          // Check if current user already joined the island before
          // If yes, set inQueueBefore to false
          if ((currentPlace != -1) && (Island.curr_index > currentPlace)) {
            inQueueBefore = true;
          }

          // Check if current queue is full
          // If yes, set isFulLQueue to true
          if ((Island.queue_list.length === Island.queue_limit)) {
            isFullQueue = true;
          }

          // Check if it is current user's turn to visit the island (Current user is on the visitor list)
          if (!inQueueBefore && (currentPlace <= (Island.visitor_limit + Island.curr_index))) {
            currentTurn = true;
          }

          // Get host information
          UserProfile.findOne({ uuid: Island.host_uuid })
            .then((Profile) => {
              if (Profile) {
                hostName = Profile.username;
              }

              // Render island page
              res.render('island', {
                found: true,
                uuid: req.user.uuid,
                is_full_queue: isFullQueue,
                in_queue_before: inQueueBefore,
                is_host: isHost,
                current_turn: currentTurn,
                island_uuid: _islandUuid,
                host_name: hostName,
                username: req.user.username,
                bell_price: Island.bell_price,
                dodo_code: Island.dodo_code,
                host_id: Island.host_uuid,
                queue_limit: Island.queue_limit,
                visitor_limit: Island.visitor_limit,
                visitor_list: Island.visitor_list,
                curr_index: Island.curr_index,
                fee: (Island.fee_required) ? 'Yes' : 'No',
                start_datetime: Island.start_time,
                description: Island.description,
                in_queue: inQueue,
                current_place: currentPlace - Island.curr_index + 1,
                active: Island.active,
                queue_list: Island.queue_list
              });
            });
        } else {
          console.log(`Island with uuid ${_islandUuid} is NOT found.`);
          res.render('island', {
            uuid: req.user.uuid,
            found: false
          });
        }
      });
  });

  // Create island hosting handler
  router.post('/create', ensureAuthenticated, function (req, res) {
    const {
      dodo_code: _dodoCode,
      bell_price: _bellPrice,
      visitor_limit: _visitorLimit,
      queue_limit: _queueLimit,
      start_date: _startDate,
      start_time: _startTime,
      description: _description,
      fee_checkbox,
    } = req.body;
    const _fee = (fee_checkbox) ? true : false;
    const _islandUuid = Date.now().valueOf();
    const _hostUuid = req.user.uuid;

    UserProfile.findOne({ uuid: _hostUuid })
      .then((Profile) => {
        if (Profile) {
          // Create a new island
          const newIsland = new Island({
            island_uuid: _islandUuid,
            host_uuid: _hostUuid,
            dodo_code: _dodoCode.toUpperCase(),
            bell_price: _bellPrice,
            start_time: `${_startDate} ${_startTime}`,
            queue_limit: _queueLimit,
            visitor_limit: _visitorLimit,
            description: _description,
            fee_required: _fee
          });

          // Notified all user currently in queue when island started
          // Set up job using agenda
          // Save agenda job to data base

          // Save new island to data base, 
          // Then, redirect to island page
          newIsland.save()
            .then((Island) => {
              if (Island) {
                // Add current island to user's hosted_island list
                // Increase the number of island hosted
                Profile.host_island_list.push(Island.island_uuid);
                Profile.island_hosted = Profile.host_island_list.length + 1;
                Profile.save()
                  .then((ResultProfile) => {
                    console.log('User island list: ' + ResultProfile.host_island_list);
                    res.redirect(`/island/${Island.island_uuid}`);
                  });
              }
            });
        }
      });
  });

  // Setting up /island socket.io server
  io.of('/island').on('connection', function (socket) {
    // Parse island uuid for room creation
    const url_regex = /^https?:\/\/.+\/island\/(\d+)$/g;
    const curr_url = socket.request.headers.referer;
    const island_uuid = url_regex.exec(curr_url)[1];

    // Debug
    console.log(`Socket (${socket.id}) is connecting to /island/${island_uuid}`);

    // On reach and leaving island page //
    // Create a specific room for that specific island
    socket.join(`${island_uuid}`, function () {
      io.of('/island').to(`${island_uuid}`).emit('joiningIsland', `${island_uuid}`);
    });

    // On disconnect
    socket.on('disconnect', function () {
      console.log(`Socket (${socket.id}) is leaving /island/${island_uuid}`);
    });

    // On socket receives handlers //
    // On user join queue
    socket.on('joinQueue', function (data) {
      // Add current user to database
      AppUtil.JoinQueue(data.island_uuid, data.curr_user_uuid, function (result) {
        // Send data to current user that joiend queue
        io.of('/island').to(`${data.socket_uuid}`).emit('joinedQueueCurr', result['queue_place']);
        io.of('/island').to(`${data.socket_uuid}`).emit('createToast', {
          tag: 'successTag',
          key: 'successJoinQueue'
        });

        // Send data to all user in the room
        io.of('/island').to(`${island_uuid}`).emit('renderIslandAll', result);
        socket.broadcast.emit('createToast', {
          tag: '',
          key: 'successJoinQueueAll'
        });
      });
    });

    // On user leaves queue
    socket.on('leaveQueue', function (data) {
      // Remove current user from database
      AppUtil.LeaveQueue(data.island_uuid, data.curr_user_uuid, function (result) {
        // Send data to current user that left queue
        io.of('/island').to(`${data.socket_uuid}`).emit('createToast', {
          tag: 'successTag',
          key: 'successLeaveQueue'
        });

        // Send data to all user in the room
        io.of('/island').to(`${island_uuid}`).emit('renderIslandAll', result);
        socket.broadcast.emit('createToast', {
          tag: '',
          key: 'successLeaveQueueAll'
        });
      });
    });

    // On host next group
    socket.on('nextGroup', function (data) {
      // Get next visitor list
      AppUtil.NextGroup(data.island_uuid, function (result) {
        // If every body in queue has visited and queue as full
        // Prompt host to close island
        if (result.is_full) {
          io.of('/island').to(`${data.socket_uuid}`).emit('nextGroupHost', {
            status: result.is_full,
            island_uuid: result.island_uuid
          });
        } else {
          // If no one is the next visitor list, prompt host that there is no one on line list
          if (result.next_visitor_list.length === 0) {
            io.of('/island').to(`${data.socket_uuid}`).emit('createToast', {
              tag: 'warningTag',
              key: 'warningEmptyVisitor'
            });
          }
        }

        // Send data to all user in that room
        io.of('/island').to(`${island_uuid}`).emit('nextGroupAll', result);
      });
    });

    // On host end island
    socket.on('endIslandHosting', function (data) {
      // Get island active status
      AppUtil.EndIslandHosting(data.island_uuid, function (result) {
        // Send data to host
        io.of('/island').to(`${data.socket_uuid}`).emit('createToast', {
          tag: 'successTag',
          key: 'successEndHosting'
        });

        // Send data to all user in that room
        io.of('/island').to(`${island_uuid}`).emit('endIslandAll', result);
        socket.broadcast.emit('createToast', {
          tag: 'warningTag',
          key: 'warningIslandEnding'
        });
      });
    });
  });

  return router;
};
