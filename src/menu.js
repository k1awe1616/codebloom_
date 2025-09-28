
//setting the username in local storage
const params = new URLSearchParams(window.location.search);
const username = params.get("username");

  if (username) {
    localStorage.setItem("username", username);
    console.log("Saved username in localStorage:", username);
  }

 