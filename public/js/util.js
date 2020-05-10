// Error messages
const TOAST_MSG = {
  'errorTag': '<strong>Error!</strong> ',
  'warningTag': '<strong>Warning!</strong> ',
  'successTag': '<strong>Success!</strong> ',
  'errorDodoCode': 'Invalid dodo code! Please enter a 5 digit alpha numeric code!',
  'errorBellPrice': 'Invalid bell price! Please enter a value greater than 0!',
  'errorVisitorLimit': 'Invalid visitor limit! Please enter a value from 1 to 6!',
  'errorQueueLimit': 'Invalid queue limit! Please enter a value from 1 to 75!',
  'errorDateTime': 'Invalid start date/time! Please enter a starting date/time that is ahead of current date/time!',
  'errorQueueLimitReached': 'Cannot join queue. Queue limit reached. Please refresh page!',
  'warningEndHost': 'Are you sure you want to stop hosting this island? This change cannot be reversed.',
  'warningLeaveQueue': 'Are you sure you want to leave queue? Your current place in queue will be lost.',
  'warningIslandEnding': 'This island has been closed by host. Please check out another island.',
  'warningFullQueue': 'Everyone on the queue has visited the island and queue limit has been reached. Do you want to close the island?',
  'warningEmptyVisitor': 'Everybody in queue already visited!',
  'warningClearVisited': 'Are you sure you want to clear your visited island history? This action cannot be undone.',
  'warningClearInactive': 'Are you sure you want to clear all your inactive island history? This action cannot be undone.',
  'warningClearAll': 'Are you sure you want to clear all your island history? This action cannot be undone.',
  'successJoinQueue': 'You have successfully joined queue for this island.',
  'successJoinQueueAll': 'A User has joined queue for this island.',
  'successLeaveQueue': 'You have successfully left queue for this island.',
  'successLeaveQueueAll': 'A User has left queue for this island.',
  'successVisitIsland': 'It is your turn to visit island. Please check island for Dodo code.',
  'successDoneVisitingIsland': 'You have done visiting the island.',
  'successEndHosting': 'You ahve successfully stop hosting this island.'
};

// Profile card navbar tab functionality
$(function () {
  $('#card-navbar a').on('click', function (e) {
    e.preventDefault();
    $(this).tab('show');
  });
});

// Island queue list functionality
$(function () {
  $('#show-queue').on('click', function (e) {
    e.preventDefault();
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $('#queue-container').addClass('d-none');
    } else {
      $(this).addClass('active');
      $('#queue-container').removeClass('d-none');
    }
  });
});

// Island filter functionality
$(function () {
  // Fee filter
  $('#fee-filter').on('click', function (e) {
    e.preventDefault();

    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $(this).text('Show Fee Not Required');

      // Remove 'd-none' if child has class 'fee-required'
      $('#island-list').children().toArray().forEach((child) => {
        if (child.classList.contains('fee-required') && child.classList.contains('d-none')) {
          child.classList.remove('d-none');
        }
      });
    } else {
      $(this).addClass('active');
      $(this).text('Show Fee Required');

      // Add 'd-none' if child has class 'fee-required'
      $('#island-list').children().toArray().forEach((child) => {
        if (child.classList.contains('fee-required')) {
          child.classList.add('d-none');
        }
      });
    }
  });

  // Active island filter
  $('#active-filter').on('click', function (e) {
    e.preventDefault();

    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $(this).text('Show Active Islands');

      // Remove 'd-none' if child has class 'inactive-island-card'
      $('#island-list').children().toArray().forEach((child) => {
        if (child.classList.contains('inactive-island-card') && child.classList.contains('d-none')) {
          child.classList.remove('d-none');
        }
      });
    } else {
      $(this).addClass('active');
      $(this).text('Show All Islands');

      // Add 'd-none' if child has class 'inactive-island-card'
      $('#island-list').children().toArray().forEach((child) => {
        if (child.classList.contains('inactive-island-card')) {
          child.classList.add('d-none');
        }
      });
    }
  });

  // Clear all filter 
  $('#clear-filter').on('click', function (e) {
    e.preventDefault();

    // Set all buttons back to inactive
    if ($('#active-filter').hasClass('active')) {
      $('#active-filter').removeClass('active');
    }
    if ($('#fee-filter').hasClass('active')) {
      $('#fee-filter').removeClass('active');
    }

    // Remove all 'd-none' calss
    $('#island-list').children().toArray().forEach((child) => {
      if (child.classList.contains('d-none')) {
        if (child.id !== 'no-card-list') {
          child.classList.remove('d-none');
        }
      }
    });
  });
});

// Host profile control 
$(function () {
  $('#host-profile-button').on('click', function (e) {
    e.preventDefault();

    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
      $('#host-profile-control').addClass('d-none');
    } else {
      $(this).addClass('active');
      $('#host-profile-control').removeClass('d-none');
    }
  });
})

// Date and time picker functionality
$(function () {
  $('.datepicker').datepicker();
  $('.timepicker').timepicker();
});

// Specify input restriction parameters
$(function () {
  // Restrict input to dodo code format: 5 digit alpha numeric value
  $('#dodo-restrict').inputFilter(function (value) {
    return (/^[A-Za-z0-9]{0,5}$/).test(value);
  });
  // Restrict input to integer greater than 0
  $('.number-restrict').inputFilter(function (value) {
    return (/^\d*$/).test(value);
  });
  // Restrict input to date format: dd/mm/yyyy
  $('#date-restrict').inputFilter(function (value) {
    return (/^([0][1-9]|[1][0-2])\/([0][1-9]|[1-2][0-9]|[3][0-1])\/\d{4}$/).test(value);
  });
  // Restrict input to time format: mm:hhAMPM
  $('#time-restrict').inputFilter(function (value) {
    return (/^([0][1-9]|[1][0-2]):([0][0-9]|[1-5][0-9])(am|pm)$/).test(value);
  });
});

// JQuery function that restricti inputs base on regex and boolean
(function ($) {
  $.fn.inputFilter = function (inputFilter) {
    return this.on('input keydown keyup mousedown mouseup select contextmenu drop', function () {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty('oldValue')) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = '';
      }
    });
  };
}(jQuery));

// Host profile control
// Clear all visited islands
function ClearVisitedIslands(uuid) {
  $('.confirm-button').click(function () {
    $.ajax({
      type: 'POST',
      url: `/dashboard/profile/deleteVisited/${uuid}`,
      data: {
        uuid: uuid
      },
      success: function(data, status) {
        window.location.reload();
        console.log(data);
      }
    });
  });
}

// Clear all inactive islands
function ClearInactiveIslands(uuid) {
  $('.confirm-button').click(function () {
    $.ajax({
      type: 'DELETE',
      url: `/dashboard/profile/deleteInactive/${uuid}`,
      data: {
        uuid: uuid
      },
      success: function(data, status) {
        window.location.reload();
        console.log(data);
      }
    });
  });
}

// Clear all (active, inactive) islands
function ClearAllIslands(uuid) {
  $('.confirm-button').click(function () {
    $.ajax({
      type: 'DELETE',
      url: `/dashboard/profile/deleteAll/${uuid}`,
      data: {
        uuid: uuid
      },
      success: function(data, status) {
        window.location.reload();
        console.log(data);
      }
    });
  });
}

// Validate create island form
function ValidateHostIslandForm() {
  const _form = document.forms["host_modal"];
  let msg = [];

  // Get values from form
  const dodoCode = _form.elements["dodo_code"].value;
  const bellPrice = _form.elements["bell_price"].value;
  const visitorLimit = _form.elements["visitor_limit"].value;
  const queueLimit = _form.elements["queue_limit"].value;
  const startDate = _form.elements["start_date"].value;
  const startTime = _form.elements["start_time"].value;

  // Validation 
  // Validate dodo code
  if (dodoCode.length < 5) {
    msg.push(TOAST_MSG['errorTag'] + TOAST_MSG['errorDodoCode']);
  }

  // Validate bell price
  if (parseInt(bellPrice) <= 0) {
    msg.push(TOAST_MSG['errorTag'] + TOAST_MSG['errorBellPrice']);
  }

  // Validate visitor limit
  if (parseInt(visitorLimit) <= 0 || parseInt(visitorLimit) > 6) {
    msg.push(TOAST_MSG['errorTag'] + TOAST_MSG['errorVisitorLimit']);
  }

  // Validate queue limit
  if (parseInt(queueLimit) <= 0 || parseInt(queueLimit) > 75) {
    msg.push(TOAST_MSG['errorTag'] + TOAST_MSG['errorQueueLimit']);
  }

  // Validate date time 
  if (moment(startDate).isBefore(moment().format('MM/DD/YYYY')) ||
    moment(startTime).isBefore(moment().format('hh:mma'))) {
    msg.push(TOAST_MSG['errorTag'] + TOAST_MSG['errorDateTime']);
  }

  // If there are errors, create toast and return false
  if (msg.length > 0) {
    msg.forEach((msg) => {
      CreateToast(msg);
    });

    return false;
  }

  return true;
}

// Given a message, create toast and append to toast container
function CreateToast(msg) {
  // Create a random ID
  const uuid = Date.now();

  // Toast Parameter
  const dataDelay = '5000';
  const debug = 'true';

  // Set toast color via class
  let colorClass;

  if (msg.startsWith('<strong>Success')) {
    colorClass = 'success_toast';
  } else if (msg.startsWith('<strong>Error')) {
    colorClass = 'error_toast';
  } else if (msg.startsWith('<strong>Warning')) {
    colorClass = 'warning_toast';
  } else {
    colorClass = 'plain_toast'
  }

  // Create toast
  const toastBody = `<div class="toast-body">${msg}</div>`;
  const closeIcon = `<i class="fas fa-times close-icon" aria-hidden="true"></i>`;
  const button = `<button type="button" class="mx-2 my-1 close" data-dismiss="toast" aria-label="Close">${closeIcon}</button>`;
  const toast = `<div id="${uuid}" class="${colorClass} toast-shape w-25" role="alert" data-delay="${dataDelay}" data-autohide="${debug}">${button}${toastBody}</div>`;

  // Append
  $(toast).appendTo("#container-toast");
  $("#" + uuid).toast('show');

  // Remove div after toast is hidden
  $("#" + uuid).on('hidden.bs.toast', function (e) {
    e.preventDefault();
    $("#" + uuid).remove();
  });
}

// Given a message, create an alert popup
function CreateAlert(msg, url, action) {
  // Attach text to alert
  $('.alert-text').empty();
  $('.alert-text').append(msg);

  // Show alert modal post if url is not empty
  // Show alert modal otherwise
  if (url) {
    $('#alert-modal-post').modal('show');

    // Attach url to form
    $('.alert-form').removeAttr('action');
    $('.alert-form').attr('action', url);
  } else {
    $('#alert-modal').modal('show');
  }
}