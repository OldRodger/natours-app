import axios from "axios";
import { showAlert } from "./alerts";

export async function login(email, password) {
  try {
    const res = await axios.post(`${location.origin}/api/v1/users/login`, {
      email,
      password,
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}

export async function logout() {
  try {
    const res = await axios.get(`${location.origin}/api/v1/users/logout`);

    if (res.data.status === "success") {
      location.assign("/");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}
