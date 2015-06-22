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
      req.contentType = "application/json"
    }

    $.ajax(req)
      .done(function(retData) {
        return cb(null, retData)
      })
      .fail(function(err) {
        return cb(err, null)
      });
  }
});