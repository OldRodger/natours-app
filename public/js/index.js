import { login, logout } from "./login.js";
import { displayMap } from "./mapbox.js";
import { updateSettings } from "./updateSettings.js";

// DOM ELEMENTS
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const logoutBtn = document.querySelector(".nav__el--logout");

// VALUES

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}


if (userDataForm) {
  userDataForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSettings("data", formData);
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSettings("password", formData);
  });
}
