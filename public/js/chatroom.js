let cur_room;
let first_count, second_count;

function init() {
  firebase.auth().onAuthStateChanged((user) => {
    var menu = $('#dynamic-menu');
    if (user) {
      var name = $("#name");
      var email = $("#email");
      var mychatroom = $("#mychatroom");

      // name / email
      name.html(user.displayName);
      email.html(user.email);

      // photo
      firebase.database().ref('users/' + name.html()).once('value').then(snapshot => {
        if(snapshot.val().photo == "user.jpg") {
          firebase.storage().ref().child("user.jpg").getDownloadURL().then(url => {
            firebase.database().ref('users/' + name.html()).update({
              photo: url
            });
            document.getElementById('photo').src = url;
          }).catch(error => {
            alert(error.message); 
          });
        }
        else
          document.getElementById('photo').src = snapshot.val().photo;
      });

      // my chatroom 
      firebase.database().ref('users/' + name.html()).on('child_added', snapshot => { // join chatroom
        if(snapshot.key != "email" && snapshot.key != "password" && snapshot.key != "name" && snapshot.key != "photo" && snapshot.key != "bio") {
          mychatroom.append(
            `<button id="roombtn" onclick="chooseChatroom(\'`+snapshot.key+`\');">`+ 
              snapshot.key +
            `</button>`);
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

      // Notification request
      if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission(function (status) {
          if (Notification.permission !== status) 
            Notification.permission = status;
        });
      }
    }
    else { // No user is signed in.
      // navbar - sign in
      menu.html("<a class='dropdown-item' href='./sign_in.html'>Sign In</a>");

      $('#left').html("");
      $('#right').html("");
    }
  });
}

function createChatroom() { // when click the create button
  var room_name = prompt("Chatroom Name", "");
  if(room_name != "") {
    var name = $("#name");
    // user
    firebase.database().ref('users/' + name.html() + "/" + room_name).set({
      room_name: room_name,
    });

    // content
    firebase.database().ref('content/' + room_name).push({
      start: name.html(),
    });
  }
}

function other(childshot, send_message, total_message) { // once - other(left)
  return new Promise(resolve => {
    firebase.database().ref("users/" + childshot.val().name).once('value').then(snapshot => {
      // photo + name
      total_message[total_message.length] = 
        `<div class="other_info popup">
          <img onclick="other_profile(event);" class="other_photo" src=`+snapshot.val().photo+`></img>
          <div class="other_name">`+childshot.val().name+`</div>
          <div class="popuptext" id="myPopup"></div>
        </div>`;
          
      //message
      if(send_message == "!/!/!Good!/!/!") {
        total_message[total_message.length] = 
          `<div id="other_good">
            <img width="70" src="./img/good_blue.jpg"></img>
          </div>`;
      }
      else if(send_message == "!/!/!Heart!/!/!") {
        total_message[total_message.length] = 
          `<div id="other_heart">
            <img width="70" src="./img/heart.png"></img>
          </div>`;
      }
      else { // text
        total_message[total_message.length] = '<div class="other">'+ send_message +'</div>';
      }
      resolve();
    });
  })
}

function first_message(snapshot, total_message) { // once
  return new Promise(async function(resolve) {
    for(var n in snapshot.val()) {
      first_count++;

      if(snapshot.child(n).hasChild("member")) { // join message(middle)
        total_message[total_message.length] = 
         `<div class="member">`+ 
            snapshot.child(n).child("member").val() +` joined the chatroom
          </div>`;
      }
      else if(snapshot.child(n).hasChild("start")) { // create message(middle)
        total_message[total_message.length] = 
          `<div class="member">`+ 
            snapshot.child(n).child("start").val() +` created the chatroom
          </div>`;
      }
      else { // me(right) or other(left)
        //replace <, >, &
        var send_message = snapshot.child(n).child("message").val().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          
        if(snapshot.child(n).child("name").val() == $("#name").html()) { // me(right)
          // message
          if(send_message == "!/!/!Good!/!/!") {
            total_message[total_message.length] = 
              `<div id="me_good">
                <img width="70" src="./img/good_blue.jpg"></img>
              </div>`;
          }
          else if(send_message == "!/!/!Heart!/!/!") {
            total_message[total_message.length] = 
              `<div id="me_heart">
                <img width="70" src="./img/heart.png"></img>
              </div>`;
          }
          else { // text
            total_message[total_message.length] = '<div class="me">'+ send_message +'</div>';
          }
        }
        else { // other(left)
          await other(snapshot.child(n), send_message, total_message);
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
  var database = firebase.database().ref('content/' + n);
  var total_message = [];
  $("#roomname").html("<b>"+cur_room+"</b>");
  $(".hide").css("visibility", "visible");

  // Loading
  content.html(`<div class="d-flex justify-content-center" style="padding: 50px;">
                  <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                  </div>
                </div>`);

  database.once('value').then(async function(snapshot) {
    // once
    await first_message(snapshot, total_message);
    content.html(total_message.join(''));
    content.scrollTop(content.height()*10);

    // on
    database.on('child_added', data => {
      if(cur_room == data.ref.parent.key) { // open the chatroom - content + notification
        second_count++;
        if (second_count > first_count) {
          if(data.hasChild("member")) { // join message(middle)
            total_message[total_message.length] = 
              `<div class="member">`+ 
                data.val().member +` joined the chatroom
              </div>`;

            // Notification - add
            if (Notification && Notification.permission === "granted") {
              var n = new Notification(data.val().member+" joined "+data.ref.parent.key);
            }

            content.html(total_message.join(''));
            content.scrollTop(content.height()*10);
          }
          else { // me(right) or other(left)
            //replace <, >, &
            var send_message = data.val().message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            if(data.val().name == name.html()) { // me(right)
              // message
              if(send_message == "!/!/!Good!/!/!") {
                total_message[total_message.length] = 
                  `<div id="me_good">
                    <img width="70" src="./img/good_blue.jpg"></img>
                  </div>`;
              }
              else if(send_message == "!/!/!Heart!/!/!") {
                total_message[total_message.length] = 
                  `<div id="me_heart">
                    <img width="70" src="./img/heart.png"></img>
                  </div>`;
              }
              else //text
                total_message[total_message.length] = '<div class="me">'+ send_message +'</div>';
              
              content.html(total_message.join(''));
              content.scrollTop(content.height()*10);
            }
            else { // other(left)
              firebase.database().ref("users/" + data.val().name).once('value').then(snapshot => {
                // name + photo
                total_message[total_message.length] = 
                  `<div class="other_info popup">
                    <img onclick="other_profile(event);" class="other_photo" src=`+snapshot.val().photo+`></img>
                    <div class="other_name">`+data.val().name+`</div>
                    <div class="popuptext" id="myPopup"></div>
                  </div>`;
                  
                // message
                if(send_message == "!/!/!Good!/!/!") {
                  total_message[total_message.length] = 
                    `<div id="other_good">
                      <img width="70" src="./img/good_blue.jpg"></img>
                    </div>`;
                }
                else if(send_message == "!/!/!Heart!/!/!") {
                  total_message[total_message.length] = 
                    `<div id="other_heart">
                      <img width="70" src="./img/heart.png"></img>
                    </div>`;
                }
                else // text
                  total_message[total_message.length] = '<div class="other">'+ send_message +'</div>';

                // Notification - other's message
                if (Notification && Notification.permission === "granted") {
                  if(send_message == "!/!/!Good!/!/!")
                    var n = new Notification(data.val().name+" sent a like");
                  else if(send_message == "!/!/!Heart!/!/!")
                    var n = new Notification(data.val().name+" sent a heart");
                  else
                    var n = new Notification(data.val().name+" sent a message: "+send_message);
                }

                content.html(total_message.join(''));
                content.scrollTop(content.height()*10);
              }); 
            }
          }
        }
      }
      else { // not open the chatroom - notification
        if(data.hasChild("member")) {
          // Notification - add
          if (Notification && Notification.permission === "granted") {
            var n = new Notification(data.val().member+" joined "+data.ref.parent.key);
          }
        }
        else {
          //replace <, >, &
          var send_message = data.val().message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
          if(data.val().name != name.html()) { //left
            // Notification - other's message
            if (Notification && Notification.permission === "granted") {
              if(send_message == "!/!/!Good!/!/!")
                var n = new Notification(data.val().name+" sent a like");
              else if(send_message == "!/!/!Heart!/!/!")
                var n = new Notification(data.val().name+" sent a heart");
              else
                var n = new Notification(data.val().name+" sent a message: "+send_message);
            }
          } 
        }
      }
    });
  })
}

function addNewMember() {
  var new_email = prompt("Email", "");
  var find = 0;
  firebase.database().ref('users/').once('value', snapshot => {
    for(var n in snapshot.val()) {
      if(snapshot.child(n).child("email").val() == new_email) {
        if(snapshot.child(n).hasChild(cur_room)) // in the chatroom
          find = -1;
        else {
          find = 1;
          firebase.database().ref('users/' + n + "/" + cur_room).set({ // add room in user
            room_name: cur_room,
          });
          firebase.database().ref('content/' + cur_room).push({ //add member message
            member: n
          })
          break;
        }
      }
    }
  }).then(() => { 
    if(find == 1)
      alert("Add Successfully!");
    else if(find == -1)
      alert("The user has been added!");
    else 
      alert("Cannot find the user!");
  });
}

function send(value) {
  if(value == "Enter") {
    sendMessage();
  }
}

function sendMessage() {
  var name = $("#name");
  var message = $("#message");

  if(message.val() != "") {
    firebase.database().ref('content/' + cur_room).push({
      name: name.html(),
      message : message.val(),
    });
    message.val("");
  }
}

function sendHeart() {
  var name = $("#name");

  firebase.database().ref('content/' + cur_room).push({
    name: name.html(),
    message : "!/!/!Heart!/!/!",    
  });
}

function sendGood() {
  var name = $("#name");

  firebase.database().ref('content/' + cur_room).push({
    name: name.html(),
    message : "!/!/!Good!/!/!",    
  });
}

function uploadPhoto(th) {
  var file = th.files[0];
  var name = $("#name");
  var photo = name.html() + '/1.jpg';

  firebase.storage().ref().child(photo).put(file).then(() => { // put file at photo
    firebase.storage().ref().child(photo).getDownloadURL().then(url => { // take img on profile
      document.getElementById('photo').src = url;
      firebase.database().ref('users/' + name.html()).update({
        photo: url
      })
    }).catch(error => {
      alert(error.message); 
    });
  }).catch(error => {
    alert(error.message); 
  });
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
    $("#content").scrollTop($("#content").height()*10);
  });
});