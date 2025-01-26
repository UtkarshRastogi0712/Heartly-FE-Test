import "./App.css";
import LoginButton from "./components/LoginButton";
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectUser from "./components/ConnectUser";
import { io } from "socket.io-client";

const socket = io("http://localhost:8001", {
  path: "/socket/",
  auth: { token: localStorage.getItem("token") },
});

function App() {
  return (
    <div>
      <h1>Heartly Test</h1>
      <LoginButton />
      <ProtectedRoute />
      <ConnectUser socket={socket} />
    </div>
  );
}

export default App;
