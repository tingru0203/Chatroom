function writeUserData() {
  var name = $("#name");
  var email = $("#email");
  var password = $("#password");

  firebase.auth().createUserWithEmailAndPassword(email.val(), password.val()).then(() => {
    firebase.auth().currentUser.updateProfile({
      displayName: name.val()
    });
    firebase.database().ref('users/' + email.val().replace('@', '_').split('.').join('_')).set({
      name: name.val(),
      email: email.val(),
      password: password.val()
    }).then(() => { 
      alert("Successfully Signed Up!");
      window.location.href = "./sign_in.html";
    }).catch(error => { 
      alert(error.message); 
    });
  }).catch(error => { 
    alert(error.message); 
  });
}

function SignIn() {
  var email = $("#email");
  var password = $("#password");
  
  firebase.auth().signInWithEmailAndPassword(email.val(), password.val()).then(() => {
    alert("Successfully Signed In!");
    window.location.href = "./index.html";
  }).catch(error => { 
    alert(error.message); 
  });
}

function SignInWithGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(result => {
    var user = result.user;
    firebase.database().ref("users/").once('value').then(snapshot => { 
      if(!snapshot.hasChild(user.email.replace('@', '_').split('.').join('_'))) {
        firebase.database().ref('users/' + user.email.replace('@', '_').split('.').join('_')).set({
          name: user.displayName,
          email: user.email
        }).then(() => {
          alert("Successfully Signed In!");
          window.location.href = "./index.html";
        })
      }
    });   
  }).catch(error => {
    alert(error.message); 
  });
}
  