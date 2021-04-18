function init() {
  firebase.auth().onAuthStateChanged((user) => {
    if(user) {
      var name = $("#name");
      var email = $("#email");
      var textarea = $("textarea");
      name.append(user.displayName);
      email.append(user.email);

      firebase.database().ref('users/' + name.html()).once('value').then(snapshot => {
        textarea.val(snapshot.val().bio);
      });
      
    }
    else {
      window.location.href = "./index.html";
    }
  });
}

function Save() {
  var textarea = $("textarea");
  firebase.database().ref('users/' + $("#name").html()).update({ //change bio 
    bio: textarea.val()
  });
  alert("Save Successfully!");
}

function chat() {
  window.location.href = "./index.html";
}