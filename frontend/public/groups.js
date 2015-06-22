$(function() {
  var groupRowTemplate = "<tr>"+
    "<td>{{id}}</td>"+
    "<td>{{name}}</td>"+
    "<td>{{members.length}}</td>"+
    "<td><button type='button' class='btn btn-xs btn-danger js-leave-group' data-id='{{id}}'><span class='glyphicon glyphicon-share' aria-hidden='true'></span></button></td>"+
    "</tr>";

  $('#newGroup').on('submit', function(e) {
    e.preventDefault();
    var data = { name: $('#inputGroupName').val() };
    ajaxReq('POST', 'http://localhost:8888/api/groups', data, function(err, data) {
      if (err) return alert("Fehler beim Erstellen der Gruppe.");
      ajaxReq('POST', 'http://localhost:8888/api/groups/'+data.id+'/member/', userobj, function(err, data2) {
        var rendered = Mark.up(groupRowTemplate, data2);
        $('#inputGroupName').val('');
        $('.js-group-table-body').prepend(rendered);
      });
    });
  });

  $('body').on('click', '.js-leave-group', function() {
    var $this = $(this);
    var gid = $(this).attr('data-id');
    ajaxReq('DELETE', 'http://localhost:8888/api/groups/' + gid + '/member/' + userobj.id, null, function(err, data) {
      if (err) return alert("Fehler beim Request zum Austritt der Gruppe");
      if ($.isEmptyObject(data))
        return $this.closest('tr').remove();

      var rendered = Mark.up(groupRowTemplate, data);
      $this.replaceWith(rendered);
    });
  });
})