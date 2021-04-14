let cur_room;
let first_count;

function init() {
  firebase.auth().onAuthStateChanged((user) => {
    var menu = $('#dynamic-menu');
    if (user) {
      // my chatroom
      var name = $("#name");
      var email = $("#email");
      var mychatroom = $("#mychatroom");
      name.html(user.displayName);
      email.html(user.email);     
      firebase.database().ref('users/' + email.html().replace('@', '_').split('.').join('_')).on('value', snapshot => {
        mychatroom.html("");
        for(var n in snapshot.val()){
          if(n != "email" && n != "password" && n != "name")
            mychatroom.append('<button id="roombtn" onclick="chooseChatroom(\''+n+'\');">'+ n +'</button>');
        }
      });

      // sign out
      menu.html("<span class='dropdown-item' id='logout-btn'>Sign Out</span>");
      document.getElementById("logout-btn").addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
          alert("Signed out Successfully!");
        }).catch(error => { 
          alert(error.message); 
        });
      });

      // Notification
      if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (status) {
          if (Notification.permission !== status) 
            Notification.permission = status;
        });
      }
    }
    else { // No user is signed in.
      menu.html("<a class='dropdown-item' href='./sign_in.html'>Sign In</a>");
      $('#left').html("");
      $('#right').html("");
    }
  });
}

function createChatroom() {
  var room_name = prompt("Chatroom Name", "");
  if(room_name != "") {
    var email = $("#email");
    firebase.database().ref('users/' + email.html().replace('@', '_').split('.').join('_') + "/" + room_name).set({
      room_name: room_name,
    });

    firebase.database().ref('content/' + room_name).set({
      start: 0,
    });
  }
}

function chooseChatroom(n) {
  first_count = 0;
  cur_room = n;
  var content = $("#content");
  var name = $("#name");
  var database = firebase.database().ref('content/' + n)
  $("#roomname").html(cur_room);
  $(".hide").css("visibility", "visible");

  database.on('value', snapshot => {
    content.html("");
    for(var i in snapshot.val()) {
      if(i != "start") { //right
        if(snapshot.val()[i].name == name.html()) {
          content.append('<div class="me_name">'+snapshot.val()[i].name+'</div>');
          content.append('<div class="me">'+snapshot.val()[i].message+'</div>');
        }
        else { //left
          content.append('<div class="other_name">'+snapshot.val()[i].name+'</div>');
          content.append('<div class="other">'+snapshot.val()[i].message+'</div>');
        }
      }
    }

    // Notification
    if(snapshot.val().name != name.html() && first_count) {
      console.log(snapshot.val().name, name.html());
      if (Notification && Notification.permission === "granted") {
        var n = new Notification("message received!!");
      }
      else {
      }
    }
    first_count = 1;
  });

}

function addNewMember() {
  var new_email = prompt("Email", "");
  var database = firebase.database().ref('users/');
  var find = 0;
  database.once('value', snapshot => {
    for(var n in snapshot.val()) {
      if(snapshot.child(n).child("email").val() == new_email) {
        find = 1;
        firebase.database().ref('users/' + n + "/" + cur_room).set({
          room_name: cur_room,
        });
        break;
      }
    }
  }).then(() => { 
    if(find)
      alert("Add Successfully!");
    else
      alert("Cannot find the user!");
  });
}

function sendMessage() {
  var name = $("#name");
  var message = $("#message");
  firebase.database().ref('content/' + cur_room).push({
    name: name.html(),
    message : message.val()
  });
  message.val("");
}

$(function () {
  'use strict';

  $('[data-toggle="offcanvas"]').on('click', function () {
    $('.offcanvas-collapse').toggleClass('open');
  });

  $('[data-toggle="offprofile"]').on('click', function () {
    $('#left').toggleClass('open');
    $('#right').toggleClass('Close');
  });
});