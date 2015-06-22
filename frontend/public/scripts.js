$(function() {
  var groupRowTemplate = "<tr>"+
    "<td>{{id}}</td>"+
    "<td>{{name}}</td>"+
    "<td>{{count}}</td>"+
    "<td><button type='button' class='btn btn-xs btn-danger js-delete-group' data-id='{{id}}'><span class='glyphicon glyphicon-trash' aria-hidden='true'></span></button></td>"+
    "</tr>";
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
      $('.js-group-table-body').prepend(render);
    })
    .fail(function() {
      alert("Fehler beim Request");
    });
  });

  $('.js-delete-group').on('click', function() {
    var $self = $(this);
    var jqxhr = $.ajax({
      method: "DELETE",
      url: "http://localhost:8888/api/groups/" + $self.attr('data-id'),
    })
    .done(function(data) {
      $self.parent('tr').remove();
    })
    .fail(function() {
      alert("Fehler beim Request");
    });
  });
});