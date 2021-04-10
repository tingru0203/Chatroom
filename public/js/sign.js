function writeUserData() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().createUserWithEmailAndPassword(email,password).then(() => {
    firebase.auth().currentUser.updateProfile({
      displayName: name
    });
    firebase.database().ref('users/' + name).set({
      email: email,
      password : password
    }).then(() => { 
      alert("Successfully Signed Up!");
      window.location.href = "./sign_in.html";
    }).catch(
      error => { alert(error.message); 
    });
  }).catch(
    error => { alert(error.message); 
  });
}

function SignIn() {
  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
    alert("Successfully Signed In!");
    window.location.href = "./index.html";
  }).catch(error => { 
    alert(error.message); 
  });
}


  