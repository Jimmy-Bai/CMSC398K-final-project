// Let page dictates socket namespace
// socket = io(<namespace>);
let socket;
let currUserUuid;

// Island Socket Handler //
$(function () {
  // On `joiningIsland`
  socket.on('joiningIsland', (data) => {
    console.log(`Joined island ${data}`);
  });

  // On `joinedQueueCurr`, update queue place and queue size
  socket.on('joinedQueueCurr', (data) => {
    // Rerender current place for current user
    $('#current-place').empty();
    $('#current-place').append(data);
  });

  // On `renderIslandAll`, update 
  socket.on('renderIslandAll', (data) => {
    // Rerender current queue size for all
    $('#current-queue-size').empty();
    $('#current-queue-size').append(`${data.queue_list.length}/${data.queue_limit}`);

    // If queue limit has been reach, render full-queue-alert
    if (data.queue_list.length >= data.queue_limit) {
      $('#full-queue-alert').removeClass('d-none');
      $('#join-button').addClass('d-none');
    } else {
      $('#full-queue-alert').addClass('d-none');
      $('#join-button').removeClass('d-none');
    }

    // Rerender queue list and visitor list
    // ID: queue-list
    // ID: visitor-list
    $('#queue-list').empty();
    if (data.queue_list.length === 0) {
      $('#queue-list').append('<li class="py-2 list-group-item">' +
        '<div class="description-box text-center">' +
        'No one in queue!</div></li>');
    } else {
      for (var i = 0; i < data.queue_list.length; i++) {
        const user = data.queue_list[i].username;
        $('#queue-list').append(`<li class="py-2 list-group-item">${i + 1}. ${user}</li>`);
      }
    }
  });

  // On 'nextGroupHost'
  socket.on('nextGroupHost', (data) => {
    // If every body on the queue has visited the island and the queue is full
    if (data.status) {
      // Create alert
      CreateAlert(TOAST_MSG['warningTag'] + TOAST_MSG[`warningFullQueue`]);

      // On confirm, end island
      EndIslandHosting(data.island_uuid);
    }
  });

  // On 'nextGroupAll'
  socket.on('nextGroupAll', (data) => {
    // Update the amount of people that have visited the island
    $('#user-visited').empty();
    $('#user-visited').append(`${data.curr_index}`);

    // Update visitor list
    $('#visitor-list').empty();

    // If no one is on the next visitor list 
    // Render 'No one is visiting!' prompt
    // Else render visitor list
    if (data.next_visitor_list.length === 0) {
      $('#visitor-list').append('<p class="card-text mb-0">No one is visiting!</p>');
    } else {
      for (var i = 0; i < data.next_visitor_list.length; i++) {
        // Append visitor list
        $('#visitor-list').append(`<p class="card-text mb-0 visitor-list-item text-left">${i + 1}. ` +
          `<span class="visitor-list-name">${data.next_visitor_list[i].username}</span></p>`);

        // Display dodo code for user in the list
        if (currUserUuid === data.next_visitor_list[i].uuid) {
          // Show Dodo code and remove leave queue button
          $('.current-turn').removeClass('d-none');
          $('#leave-queue-button').addClass('d-none');

          // Expand current place container
          $('#current-place-col').removeClass('col-sm-3');
          $('#current-place-col').addClass('col-sm-6');

          // Expand visitor list container
          $('#visitor-list-col').removeClass('col-sm-3');
          $('#visitor-list-col').addClass('col-sm-6');
        }
      }
    }

    // Remove everyone from the previous visitor list
    data.prev_visitor_list.forEach((user) => {
      if (user.uuid === currUserUuid) {
        $('.after-visiting').removeClass('d-none');
        $('.after-joining').addClass('d-none');
        $('.current-turn').addClass('d-none');
      }
    });
  });

  // On 'endIslandAll'
  socket.on('endIslandAll', (data) => {
    if (!data) {
      // Remove host control
      $('#host-control').addClass('d-none');

      // Remove client view
      $('#client-view').addClass('d-none');

      // Render island active status
      $('#island-active').addClass('d-none');
      $('#island-inactive').removeClass('d-none');
    }
  });

  // On 'createToast'
  socket.on('createToast', (data) => {
    if (data.tag.length === 0) {
      CreateToast(TOAST_MSG[data.key]);
    } else {
      CreateToast(TOAST_MSG[data.tag] + TOAST_MSG[data.key]);
    }
  });
});

// Current user join queue
function JoinQueue(islandUuid, currUserUuid) {
  // Hide 'Join Queue' button and show 'after-joining' elements
  $('.after-joining').removeClass('d-none');
  $('.before-joining').addClass('d-none');

  // Sent data to sockets
  socket.emit('joinQueue', {
    socket_uuid: socket.id,
    island_uuid: islandUuid,
    curr_user_uuid: currUserUuid
  });
}

// Current user leave queue
function LeaveQueue(islandUuid, currUserUuid) {
  $('.confirm-button').click(function () {
    // Hide 'after-joining' elements and show 'Join Queue' button
    $('.after-joining').addClass('d-none');
    $('.before-joining').removeClass('d-none');

    // Sent data to sockets
    socket.emit('leaveQueue', {
      socket_uuid: socket.id,
      island_uuid: islandUuid,
      curr_user_uuid: currUserUuid
    });
  });
}

// Host put next group into visitor list
function NextGroup(islandUuid) {
  // Send data to sockets
  socket.emit('nextGroup', {
    socket_uuid: socket.id,
    island_uuid: islandUuid
  });
}

// Host stops island hosting
function EndIslandHosting(islandUuid) {
  $('.confirm-button').click(function () {
    // Send data to sockets
    socket.emit('endIslandHosting', {
      socket_uuid: socket.id,
      island_uuid: islandUuid
    });
  });
}
