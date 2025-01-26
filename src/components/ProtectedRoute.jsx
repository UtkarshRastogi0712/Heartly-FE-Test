import React from "react";

function ProtectedRoute() {
  const fetchUsers = async () => {
    console.log("Fetching protected route");
    try {
      const usersData = await fetch("http://localhost:8000/users/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
      });
      const users = await usersData.json();
      console.log(users);
    } catch (error) {
      console.error("Couldnt fetch ", error);
    }
  };
  return (
    <div>
      <button onClick={fetchUsers}>Protected Route</button>
    </div>
  );
}

export default ProtectedRoute;
