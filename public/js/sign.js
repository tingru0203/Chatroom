function writeUserData() {
  var name = $("#name");
  var email = $("#email");
  var password = $("#password");

  firebase.auth().createUserWithEmailAndPassword(email.val(), password.val()).then(() => {
    firebase.auth().currentUser.updateProfile({
      displayName: name.val()
    });
    firebase.database().ref('users/' + name.val()).set({
      name: name.val(),
      email: email.val(),
      password: password.val(),
      photo: "user.jpg",
      boi: "Hi!"
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
      if(!snapshot.hasChild(user.displayName)) {
        firebase.database().ref('users/' + user.displayName).set({
          name: user.displayName,
          email: user.email,
          photo: "user.jpg",
          bio: "Hi!"
        }).then(() => {
          alert("Successfully Signed In!");
          window.location.href = "./index.html";
        })
      }
      else {
        alert("Successfully Signed In!");
        window.location.href = "./index.html";
      }
    });   
  }).catch(error => {
    alert(error.message); 
  });
}
  