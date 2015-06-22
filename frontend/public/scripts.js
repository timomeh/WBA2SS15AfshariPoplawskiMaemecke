$(function() {
  var groupRowTemplate = "<tr><td>{{id}}</td><td>{{name}}</td><td>{{count}}</td></tr>"
  $('#newGroup').on('submit', function(e) {
    e.preventDefault();
    var jqxhr = $.ajax({
      method: "POST",
      url: "http://localhost:8888/api/groups",
      data: JSON.stringify({ name: $('#inputGroupName').val() }),
      contentType: "application/json"
    })
    .done(function(data) {
      if (data.members) {
        data.count = data.members.length;
      } else {
        data.count = 0;
      }
      var render = Mark.up(groupRowTemplate, data);
      console.log(render);
      $('.js-group-table-body').prepend(render);
    })
    .fail(function() {
      alert("Fehler beim Request");
    })
  });
});