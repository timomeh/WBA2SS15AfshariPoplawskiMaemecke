$(function() {
  /**
   * Example:
   *
   * ajaxReq('GET', 'http://localhost:8000/api/groups', null, function(err, data) {
   *   if (err) {
   *     // Error Behandlung
   *   }
   *   // Weitermachen
   * });
   *
   * ajaxReq('POST', http://localhost:8000/api/groups', { name: "Testgruppe" }, function(err, data) {
   *   if (err) {
   *     // Error Behanldung
   *   }
   *   console.log(data.name); // = Output des Requests
   * })
   */
  window.ajaxReq = function(method, url, data, cb) {
    var req = {
      method: method,
      url: url,
    };
    if (method === 'POST') {
      req.data = JSON.stringify(data);
      req.contentType = "application/json";
    }

    $.ajax(req)
      .done(function(retData) {
        return cb(null, retData);
      })
      .fail(function(err) {
        return cb(err, null);
      });
  };

  var notifyTemplate = '<li class="js-notify-item is-unread" data-id="{{id}}"><a href="/notifications#not{{id}}">{{message}}</a></li>';

  if (window.socket) {
    $('body').on('click', '.js-notify-item', function() {
      var id = $(this).attr('data-id');
      socket.emit('read', { notifyId: id, userId: userobj.id });
    });

    socket.on(userobj.id, function(data) {
      console.log(data);
      var $notifyCount = $('.js-notify-unread');
      var notifyCount = parseInt($notifyCount.text(), 10);
      $notifyCount.text(notifyCount+1);

      var notification = Mark.up(notifyTemplate, data);
      $('.js-notifications').prepend(notification);
    });
  }
});