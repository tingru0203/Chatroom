function init() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      document.getElementById("name").innerHTML = user.displayName;
      document.getElementById("email").innerHTML = user.email;
    } else {
        // No user is signed in.
    }
  });
}

function createChatroom() {

}
