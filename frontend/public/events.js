$(function() {
  $('body').on('click', '.js-leave-event', function() {
    
    // Get UserDi and EventID
    var eid = $(this).attr('data-eid');
    var uid = $(this).attr('data-uid');

    // Delete desired User from event
    ajaxReq('DELETE', 'http://localhost:8888/api/events/' + eid + '/member/' + uid, null, function(err, data) {
      if (err) {
        // Error handling
        alert('Oops, somethign went wrong. Please try again in a minute.');
      } else {
        // All good, delete the Event from the view
        console.log('Updated the event');
        $('#event-'+eid).remove();
      }
    });
  });
});