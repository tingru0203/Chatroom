function writeUserData() {
  var name = $("#name");
  var email = $("#email");
  var password = $("#password");

  firebase.auth().createUserWithEmailAndPassword(email.val(), password.val()).then(() => {
    firebase.auth().currentUser.updateProfile({
      displayName: name.val()
    });
    firebase.database().ref('users/' + name.val()).set({
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
  firebase.auth().signInWithPopup(provider).then(() => {
    alert("Successfully Signed In!");
    window.location.href = "./index.html";
  }).catch(error => {
    alert(error.message); 
  });
}
  