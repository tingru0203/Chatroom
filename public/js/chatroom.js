let cur_room;
let first_count, second_count;

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

      firebase.database().ref('users/' + email.html().replace('@', '_').replace('.', '_')).once('value').then(snapshot => {
        var photo = snapshot.child("photo").val();
        if(photo != "user.jpg")
          photo = name.html() + "/1.jpg";
        firebase.storage().ref().child(photo).getDownloadURL().then(url => {
          var img = document.getElementById('photo');
          img.src = url;
        }).catch(error => {
          alert(error.message); 
        });
      });

      firebase.database().ref('users/' + email.html().replace('@', '_').replace('.', '_')).on('value', snapshot => {
        mychatroom.html("");
        for(var n in snapshot.val()){
          if(n != "email" && n != "password" && n != "name" && n != "photo")
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
    firebase.database().ref('users/' + email.html().replace('@', '_').replace('.', '_') + "/" + room_name).set({
      room_name: room_name,
    });

    firebase.database().ref('content/' + room_name).set({
      start: 0,
    });
  }
}

function other(childshot, send_message) {
  return new Promise(resolve => {
    firebase.storage().ref().child(childshot.val().name + "/1.jpg").getDownloadURL().then(url => {
      $("#content").append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
      $("#content").append('<div class="other">'+ send_message +'</div>');
      console.log(1);
      resolve();
    }).catch(() => {
      firebase.storage().ref().child("user.jpg").getDownloadURL().then(url => {
        $("#content").append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
        $("#content").append('<div class="other">'+ send_message +'</div>');
        console.log(2);
        resolve();
      });
    });
  });
}

function promise_message(snapshot) {
  return new Promise(resolve => {
    snapshot.forEach(async function(childshot) {
      console.log("t");
      if(childshot.key != "start") {
        first_count++;
        var send_message = childshot.val().message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if(childshot.val().name == $("#name").html()) { //right
          $("#content").append('<div class="me">'+ send_message +'</div>');
        }
        else { //left
          await other(childshot, send_message);
          /*firebase.storage().ref().child(childshot.val().name + "/1.jpg").getDownloadURL().then(url => {
            $("#content").append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
            $("#content").append('<div class="other">'+ send_message +'</div>');
          }).catch(() => {
            firebase.storage().ref().child("user.jpg").getDownloadURL().then(url => {
              $("#content").append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
              $("#content").append('<div class="other">'+ send_message +'</div>');
            });
          });*/
        }
      }
    })
    //resolve();
  });
}

function chooseChatroom(n) {
  first_count = second_count = 0;
  cur_room = n;
  var content = $("#content");
  var name = $("#name");
  var database = firebase.database().ref('content/' + n)
  $("#roomname").html(cur_room);
  $(".hide").css("visibility", "visible");

  content.html("");
  database.once('value').then(async function(snapshot) {
    await promise_message(snapshot);
    console.log("a");
    /*snapshot.forEach(function(childshot) {
      if(childshot.key != "start") {
        var send_message = childshot.val().message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if(childshot.val().name == name.html()) { //right
          content.append('<div class="me">'+ send_message +'</div>');
        }
        else { //left
          //await other(childshot, send_message);
          firebase.storage().ref().child(childshot.val().name + "/1.jpg").getDownloadURL().then(url => {
            content.append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
            content.append('<div class="other">'+ send_message +'</div>');
          }).catch(() => {
            firebase.storage().ref().child("user.jpg").getDownloadURL().then(url => {
              content.append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+childshot.val().name+'</div></div>');
              content.append('<div class="other">'+ send_message +'</div>');
            });
          });
        }
      }

      first_count++;
    })*/

    /*database.on('child_added', function(data) {
      second_count++;

      if (second_count > first_count) {
        var send_message = data.val().message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if(data.val().name == name.html()) { //right
          content.append('<div class="me">'+ send_message +'</div>');
        }
        else { //left
          //await other(data, send_message);
          console.log("f2");
          firebase.storage().ref().child(data.val().name + "/1.jpg").getDownloadURL().then(url => {
            content.append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+data.val().name+'</div></div>');
            content.append('<div class="other">'+ send_message +'</div>');
          }).catch(() => {
            firebase.storage().ref().child("user.jpg").getDownloadURL().then(url => {
              content.append('<div class="other_info"><img class="other_photo" src='+url+'></img><div class="other_name">'+data.val().name+'</div></div>');
              content.append('<div class="other">'+ send_message +'</div>');
            });
          });

          // Notification
          console.log("noti");
          if (Notification && Notification.permission === "granted") {
            var n = new Notification("message received!!");
          }
        } 
      }

      content.scrollTop(content.height()*10);
    });*/
  })
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
    $('#img1').toggleClass('hideImg');
    $('#img2').toggleClass('showImg');
    $("#content").scrollTop($("#content").height());
  });
});

function uploadPhoto(th) {
  var file = th.files[0];
  var photo = $("#name").html() + '/1.jpg';

  firebase.storage().ref().child(photo).put(file).then(function(snapshot) {
    firebase.storage().ref().child(photo).getDownloadURL().then(url => {
      var img = document.getElementById('photo');
      img.src = url;
    }).catch(error => {
      alert(error.message); 
    });
  }).catch(error => {
    alert(error.message); 
  });

  firebase.database().ref('users/' + $("#email").html().replace('@', '_').split('.').join('_')).update({
    photo: "1.jpg"
  })
}