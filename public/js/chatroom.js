let cur_room;

function init() {
  firebase.auth().onAuthStateChanged((user) => {
    var menu = $('#dynamic-menu');
    if (user) {
      var name = $("#name");
      var email = $("#email");
      name.html(user.displayName);
      email.html(user.email);
      
      var mychatroom = $("#mychatroom");
      firebase.database().ref('users/' + name.html()).once('value', snapshot => {
        for(var n in snapshot.val()){
          if(n != "email" && n != "password") {
            mychatroom.append('<button onclick="chooseChatroom(\''+n+'\');">'+ n +'</button>');
            //mychatroom.append('<button id="roombtn">' + n +'</button><br>');
          }
            //mychatroom.append(`<button onclick="chooseChatroom(${n});">`+ n +'</button><br>');
        }
      });

      //logout
      menu.html("<span class='dropdown-item' id='logout-btn'>Sign Out</span>");
            var logout = document.getElementById("logout-btn");
            logout.addEventListener('click', function() {
                firebase.auth().signOut().then(function() {
                    alert("Logouted Successfully!");
                }).catch(error => { 
                    alert(error.message); 
                });
            });
    } else {
      menu.html("<a class='dropdown-item' href='./sign_in.html'>Sign In</a>");
      $('#left').html("");
      $('#right').html("");
      // do something else
    }
  });
}

function createChatroom() {
  var room_name = prompt("Chatroom Name", "");
  var name = $("#name");

  var mychatroom = $("#mychatroom");
  firebase.database().ref('users/' + name.html() + "/" + room_name).set({
    room_name: room_name,
  });

  firebase.database().ref('content/' + room_name).set({
    start: 0,
  });

  //mychatroom.append('<button id="roombtn">' + room_name +'</button><br>');
  mychatroom.append('<button onclick="chooseChatroom(\''+room_name+'\');">'+ room_name +'</button>');
  //$("#roombtn").addEventListener("click", function(){ chooseChatroom(room_name); });
}

function chooseChatroom(n) {
  cur_room = n;
  console.log(n);
  var database = firebase.database().ref('content/' + n);
  var content = $("#content");
  var roomname = $("#roomname");
  var hide = $(".hide");
  var name = $("#name");
  roomname.html(cur_room);
  hide.css("visibility", "visible");
  database.on('value', snapshot => {
    content.html("");
    for(var i in snapshot.val()){
      if(i != "start") {
        if(snapshot.val()[i].name == name.html()) {
          content.append('<div class="me_name">'+snapshot.val()[i].name+'</div>');
          content.append('<div class="me">'+snapshot.val()[i].message+'</div>');
        }
        else {
          content.append('<div class="other_name">'+snapshot.val()[i].name+'</div>');
          content.append('<div class="other">'+snapshot.val()[i].message+'</div>');
        }
      }
    }
  });
}

function addNewMember() {
  var new_email = prompt("Email", "");
  var database = firebase.database().ref('users/');
  database.once('value', snapshot => {
    for(var n in snapshot.val()) {
      if(snapshot.child(n).child("email").val() == new_email) {
        console.log(n);
        firebase.database().ref('users/' + n + "/" + cur_room).set({
          room_name: cur_room,
        });
        break;
      }
    }
  }).then(() => { 
    alert("Add Successfully!");
  });
}

function sendMessage() {
  var name = $("#name");
  var message = $("#message");
  console.log(cur_room);
  var database = firebase.database().ref('content/' + cur_room);
  database.push({
    name: name.html(),
    message : message.val()
  });
  message.val("");
}
