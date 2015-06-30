$(function() {
  var groupRowTemplate = "<tr>"+
    "<td>{{id}}</td>"+
    "<td>{{name}}</td>"+
    "<td>{{members.length}}</td>"+
    "<td><div class='btn-group'>"+
    "<button type='button' class='btn btn-xs btn-danger js-leave-group' data-id='{{id}}'><span class='glyphicon glyphicon-share' aria-hidden='true'></span></button>"+
    "<button type='button' class='btn btn-xs btn-success js-add-to-group' data-toggle='modal' data-target='#inviteUserModal' data-id='{{id}}'><span class='glyphicon glyphicon-log-in' aria-hidden='true'></span></button>"+
    "</div></td>"+
    "</tr>";

  var helpText = '<span class="help-block">{{message}}</span>';

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

  $('#inviteUserModal').on('hidden.bs.modal', function(e) {
    $('.js-invite-user').removeClass('btn-success').addClass('btn-primary').text('Einladen').removeAttr('disabled');
    $('.js-invite-user').find('.glyphicon').remove();
    $('#inviteUserId').val('');
  });

  var inviteToGroupId;
  $('#inviteUserModal').on('show.bs.modal', function(e) {
    inviteToGroupId = $(e.relatedTarget).attr('data-id');
  });

  $('#inviteUserId').on('focus', function() {
    var $formGroup = $(this).parent('.form-group');
    $formGroup.removeClass('has-error');
    $formGroup.find('.help-block').remove();
  });

  $('.js-invite-user').on('click', function() {
    var data = {
      username: $('#inviteUserName').val(),
      groupId: inviteToGroupId,
      fromId: userobj.id
    };
    ajaxReq('POST', 'http://localhost:8000/groups/invite', data, function(err, data) {
      if (err) return alert("Fehler beim Einladen (AJAX Error)");
      if (data) {
        if (data.error === 'USERNOTFOUND') {
          var help = Mark.up(helpText, { message: 'Dieser User existiert nicht' });
          $('#inviteUserId').parent('.form-group').addClass('has-error');
          $('#inviteUserId').parent('.form-group').append(help);
        }
        else if (data.error === 'SAMEUSER') {
          var help = Mark.up(helpText, { message: 'Du kannst dich nicht selbst einladen' });
          $('#inviteUserId').parent('.form-group').addClass('has-error');
          $('#inviteUserId').parent('.form-group').append(help);
        }

        else if (data.error === 'ALREADYINGROUP') {
          var help = Mark.up(helpText, { message: 'Dieser User ist bereits Mitglied in der Gruppe' });
          $('#inviteUserId').parent('.form-group').addClass('has-error');
          $('#inviteUserId').parent('.form-group').append(help);
        }

        else if (data.error === 'GROUPNOTFOUND') {
          var help = Mark.up(helpText, { message: 'Die Gruppe, in die der User hinzugefügt werden soll, existiert nicht' });
          $('#inviteUserId').parent('.form-group').addClass('has-error');
          $('#inviteUserId').parent('.form-group').append(help);
        }
      }

      else {
        $('.js-invite-user').removeClass('btn-primary').addClass('btn-success').text('Abgeschickt!').prepend('<span class="glyphicon glyphicon glyphicon-ok"></span> ').attr('disabled', 'disabled');
      }
    });
  });
});