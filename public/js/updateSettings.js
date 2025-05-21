import axios from "axios";
import { showAlert } from "./alerts";

export async function updateSettings(type, formData) {
  try {
    const url = type === "data" ? `${location.origin}/api/v1/users/updateMe` : `${location.origin}/api/v1/users/updateMyPassword`;

    const { data } = await axios.patch(url, formData);
    if (data.status === "success") showAlert("success", "Data updated successfully!");
  } catch (error) {
    console.log(error);
    showAlert("error", error.response.data.message);
  }
}
