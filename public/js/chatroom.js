let cur_room;
let first_count, second_count;

function init() {
  firebase.auth().onAuthStateChanged((user) => {
    var menu = $('#dynamic-menu');
    if (user) {
      var name = $("#name");
      var email = $("#email");
      var mychatroom = $("#mychatroom");
      name.html(user.displayName);
      email.html(user.email);

      // photo
      firebase.database().ref('users/' + name.html()).once('value').then(snapshot => {
        var photo = snapshot.val().photo;
        if(photo != "user.jpg")
          photo = name.html() + "/1.jpg";
        firebase.storage().ref().child(photo).getDownloadURL().then(url => {
          var img = document.getElementById('photo');
          img.src = url;
        }).catch(error => {
          alert(error.message); 
        });
      });

      // my chatroom 
      firebase.database().ref('users/' + name.html()).on('value', snapshot => {
        mychatroom.html("");
        for(var n in snapshot.val()){
          if(n != "email" && n != "password" && n != "name" && n != "photo" && n != "bio")
            mychatroom.append('<button id="roombtn" onclick="chooseChatroom(\''+n+'\');">'+ n +'</button>');
        }
      });

      // navbar - profile
      menu.html("<span class='dropdown-item' id='profile_page'>Your Profile</span>");
      document.getElementById("profile_page").addEventListener('click', () => {
        window.location.href = "./profile.html";
      });

      // navbar - sign out
      menu.append("<span class='dropdown-item' id='logout-btn'>Sign Out</span>");
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
    var name = $("#name");
    firebase.database().ref('users/' + name.html() + "/" + room_name).set({
      room_name: room_name,
    });

    firebase.database().ref('content/' + room_name).set({
      start: 0,
    });
  }
}

function other(childshot, send_message) {
  return new Promise(resolve => {
    firebase.database().ref("users/"+childshot.val().name).once('value').then(snapshot => {
      var photo = snapshot.val().photo;
      if(photo != "user.jpg")
        photo = childshot.val().name + "/1.jpg";

      firebase.storage().ref().child(photo).getDownloadURL().then(url => {
        $("#content").append(`<div class="other_info popup">
                                <img onclick="other_profile(event);" class="other_photo" src=`+url+`></img>
                                <div class="other_name">`+childshot.val().name+`</div>
                                <div class="popuptext" id="myPopup"></div>
                              </div>`);
        $("#content").append('<div class="other">'+ send_message +'</div>');
        resolve();
      })
    });
  });
}

function first_message(snapshot) {
  return new Promise(async function(resolve) {
    for(var n in snapshot.val()) {
      first_count++;
      if(snapshot.child(n).key != "start") {
        //replace <, >, &
        var send_message = snapshot.child(n).child("message").val().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
        
        if(snapshot.child(n).child("name").val() == $("#name").html()) { //right
          $("#content").append('<div class="me">'+ send_message +'</div>');
        }
        else { //left
          await other(snapshot.child(n), send_message);
        }
      }
    }
    resolve();
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
    // once
    await first_message(snapshot);

    // on
    database.on('child_added', function(data) {
      second_count++;
      if (second_count > first_count) {
        //replace <, >, &
        var send_message = data.val().message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
        
        if(data.val().name == name.html()) { //right
          content.append('<div class="me">'+ send_message +'</div>');
        }
        else { //left
          var photo = data.val().photo;
          if(photo != "user.jpg") 
            photo = data.val().name + "/1.jpg";

          firebase.storage().ref().child(photo).getDownloadURL().then(url => {
            $("#content").append(`<div class="other_info popup">
                                    <img onclick="other_profile(event);" class="other_photo" src=`+url+`></img>
                                    <div class="other_name">`+data.val().name+`</div>
                                    <div class="popuptext" id="myPopup"></div>
                                  </div>`);
            $("#content").append('<div class="other">'+ send_message +'</div>');
          })

          // Notification
          if (Notification && Notification.permission === "granted") {
            var n = new Notification("message received!!");
          }
        } 
      }

      content.scrollTop(content.height()*10);
    });
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
    message : message.val(),
  });
  message.val("");
}

function uploadPhoto(th) {
  var file = th.files[0];
  var photo = $("#name").html() + '/1.jpg';

  firebase.storage().ref().child(photo).put(file).then(() => { // put file at photo
    firebase.storage().ref().child(photo).getDownloadURL().then(url => { // take img on profile
      var img = document.getElementById('photo');
      img.src = url;
    }).catch(error => {
      alert(error.message); 
    });
  }).catch(error => {
    alert(error.message); 
  });

  firebase.database().ref('users/' + $("#name").html()).update({ //change photo 
    photo: "1.jpg"
  })
}

function other_profile(event) {
  var name = event.path[1]["childNodes"][3].innerHTML; // the person's name
  var popup = $("#myPopup");
  var popuptext = $(".popuptext");
  popuptext.html("");
  firebase.database().ref('users/' + name).once('value').then(snapshot => {
    popuptext.append("<b>Name: </b>"+name+"<br>");
    popuptext.append("<b>E-mail: </b>"+snapshot.val().email+"<br>");
    popuptext.append("<b>Bio: </b>"+snapshot.val().bio+"<br>");
  });
  popup.toggleClass("show");
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