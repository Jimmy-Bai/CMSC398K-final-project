// Load in data base
const UserProfile = require('../../db/UserProfile');
const Island = require('../../db/Island');

// ISLAND APP UTIL //
// Join queue and add to database
function JoinQueue(islandUuid, userUuid, callback) {
  let queuePlace = 0;
  let callbackData = {};

  // Look for island
  Island.findOne({ island_uuid: islandUuid })
    .then((IslandProfile) => {
      // Look for user
      UserProfile.findOne({ uuid: userUuid })
        .then((Profile) => {
          // Add username, uuid pair to queue list
          IslandProfile.queue_list.push({
            username: Profile.username,
            uuid: userUuid
          });

          // Increase the number of island visited for user
          // Add island to user's visited list
          Profile.island_visited = Profile.island_visited + 1;
          Profile.visit_island_list.push(islandUuid);

          // Save profile, then save island profile
          Profile.save()
            .then(() => {
              // Save queue list to island and return queue place with call back
              IslandProfile.save()
                .then((ResultProfile) => {
                  if (ResultProfile) {
                    // Get data needed for rendering
                    queuePlace = ResultProfile.queue_list.findIndex((user) => user.uuid === parseInt(userUuid)) + 1;

                    // Put data into object then return through callback function
                    callbackData['queue_place'] = queuePlace - ResultProfile.curr_index;
                    callbackData['queue_list'] = ResultProfile.queue_list;
                    callbackData['queue_limit'] = ResultProfile.queue_limit;

                    callback(callbackData);
                  }
                });
            });
        });
    });
}

// Leave queue and remove from data base
function LeaveQueue(islandUuid, userUuid, callback) {
  let callbackData = {};

  // Look for island
  Island.findOne({ island_uuid: islandUuid })
    .then((IslandProfile) => {
      // Look for user
      UserProfile.findOne({ uuid: userUuid })
        .then((Profile) => {
          // Remove username, uuid pair from queue list
          const filteredIslandList = IslandProfile.queue_list.filter((user) => user.uuid !== userUuid);
          IslandProfile.queue_list = filteredIslandList;

          // Decrease the number of island visited for user
          // Remove island from user's visited list
          const filteredVisitList = Profile.visit_island_list.filter((island) => island !== islandUuid);
          Profile.island_visited = Profile.island_visited - 1;
          Profile.visit_island_list = filteredVisitList;

          // Save profile first then save island profile
          Profile.save()
            .then(() => {
              // Save queue list to island and return queue place with call back
              IslandProfile.save()
                .then((ResultProfile) => {
                  if (ResultProfile) {
                    // Put data into object then return through callback function
                    callbackData['queue_list'] = ResultProfile.queue_list;
                    callbackData['queue_limit'] = ResultProfile.queue_limit;

                    callback(callbackData);
                  }
                });
            });
        });
    });
};

// Queue next group into visitor list
// Replace current group with next group
function NextGroup(islandUuid, callback) {
  let callbackData = {};
  let isFull = false;
  let nextVisitorList = [];

  // Look for island
  Island.findOne({ island_uuid: islandUuid })
    .then((IslandProfile) => {
      // The number of people that have visited
      const nextIndex = IslandProfile.curr_index + IslandProfile.visitor_list.length;
      IslandProfile.curr_index = nextIndex;

      if (nextIndex === IslandProfile.queue_limit) {
        isFull = true;
      }

      // Get the next list of visitors
      for (var i = nextIndex; i < IslandProfile.queue_limit; i++) {
        if (i < IslandProfile.queue_list.length) {
          nextVisitorList.push(IslandProfile.queue_list[i]);
        }
      }

      // Get previous visiotr list 
      const prevVisitorList = IslandProfile.visitor_list;
      // Save next visitor list to island
      IslandProfile.visitor_list = nextVisitorList;

      // Save new curr index to p
      IslandProfile.save()
        .then((ResultProfile) => {
          if (ResultProfile) {
            callbackData['next_visitor_list'] = ResultProfile.visitor_list;
            callbackData['prev_visitor_list'] = prevVisitorList;
            callbackData['is_full'] = isFull;
            callbackData['curr_index'] = ResultProfile.curr_index;
            callbackData['island_uuid'] = ResultProfile.island_uuid;

            callback(callbackData);
          }
        });
    });
}

// Set island active to false
// Save to data base
function EndIslandHosting(islandUuid, callback) {
  // Look for island
  Island.findOne({ island_uuid: islandUuid })
    .then((IslandProfile) => {
      // Set island activ to false
      IslandProfile.active = false;

      // Save new curr index to p
      IslandProfile.save()
        .then((ResultProfile) => {
          if (ResultProfile) {
            callback(ResultProfile.active);
          }
        });
    });
}

module.exports = {
  JoinQueue: JoinQueue,
  LeaveQueue: LeaveQueue,
  NextGroup: NextGroup,
  EndIslandHosting: EndIslandHosting
}