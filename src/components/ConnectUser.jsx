import Peer from "peerjs";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidV4 } from "uuid";

function ConnectUser({ socket }) {
  const [showCalls, setShowCalls] = useState(false);
  const [username, setUsername] = useState("");
  const [reciever, setReciever] = useState("");
  const [joined, setJoined] = useState(false);
  const [myMediaStream, setMyMediaStream] = useState();
  const [theirMediaStream, setTheirMediaStream] = useState();
  const [myPeerId, setMyPeerId] = useState();

  const myVideoBox = useRef(null);
  const theirVideoBox = useRef(null);
  const peerRef = useRef(null);

  const id = uuidV4();
  const options = {
    host: "localhost",
    port: 8000,
    path: "/peerjs/peer",
  };

  const flipState = () => setShowCalls((showCalls) => !showCalls);

  const getUserMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyMediaStream(stream);
    } catch {
      console.log("Couldnt get media");
      return;
    }
  };
  const createCall = (peerId) => {
    const peer = peerRef.current;

    const call = peer.call(peerId, myMediaStream);

    call.on("stream", (stream) => {
      console.log("recieving a call");
      setTheirMediaStream(stream);
    });
  };

  const handleJoin = async () => {
    console.log(username);
    if (username.trim()) {
      setJoined(true);
      await getUserMediaStream();
    } else {
      alert("Please enter username");
    }
  };

  const handleReciver = () => {
    console.log(reciever);
    if (reciever.trim()) {
      socket.emit("request-call", { reciever });
    } else {
      alert("Please enter reciver name");
    }
  };

  const handleCall = async (caller, roomId) => {
    socket.emit("call-accepted", {
      caller,
      roomId,
      peerId: myPeerId,
    });
  };

  function onUserNotFound() {
    console.log(
      "Couldnt place call as the user could not be found among those online",
    );
  }
  function onCallRequest({ caller, roomId }) {
    if (confirm(`You have a call request from ${caller}`) == true) {
      handleCall(caller, roomId);
    } else {
      socket.emit("call-denied", { caller, roomId });
    }
  }
  function onCallDenied({ username }) {
    console.log(`Call denied by user ${username}`);
  }
  async function onCallAccepted({ username, peerId }) {
    console.log("Call accepted by reciever", username);
    createCall(peerId);
  }

  useEffect(() => {
    socket.on("User-not-found", onUserNotFound);
    socket.on("call-request", onCallRequest);
    socket.on("call-denied", onCallDenied);
    socket.on("call-accepted", onCallAccepted);

    return () => {
      socket.off("User-not-found", onUserNotFound);
      socket.off("call-request", onCallRequest);
      socket.off("call-denied", onCallDenied);
      socket.off("call-accepted", onCallAccepted);
    };
  });

  useEffect(() => {
    console.log("Creating a new peer");
    const peer = new Peer(id, options);

    peer.on("open", (peerId) => {
      console.log("PeerId:", peerId);
      setMyPeerId(peerId);
    });

    peer.on("call", (call) => {
      console.log("recieving a call");
      call.answer(myMediaStream);
      call.on("stream", (stream) => {
        setTheirMediaStream(stream);
      });
    });

    /*
    peer.on("close", () => {
      peer.destroy();
      socket.emit("peer-cleanup");
    });
    peer.on("disconnected", () => {
      peer.destroy();
      socket.emit("peer-cleanup");
    });
    peer.on("error", () => {
      peer.destroy();
      socket.emit("peer-cleanup");
    });
        */
    peerRef.current = peer;
  }, [joined]);

  useEffect(() => {
    if (myMediaStream && myVideoBox.current) {
      myVideoBox.current.srcObject = myMediaStream;
    }
  }, [myMediaStream]);

  useEffect(() => {
    if (theirMediaStream && theirVideoBox.current) {
      theirVideoBox.current.srcObject = theirMediaStream;
    }
  }, [theirMediaStream]);

  return (
    <div>
      <h1>Call Users</h1>
      <button onClick={flipState}>Try me</button>
      {showCalls && (
        <div>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin} style={{ marginLeft: "10px" }}>
            Join
          </button>
        </div>
      )}
      {joined && (
        <div>
          <input
            type="text"
            placeholder="Enter username to call"
            value={reciever}
            onChange={(e) => setReciever(e.target.value)}
          />
          <button onClick={handleReciver} style={{ marginLeft: "10px" }}>
            Join
          </button>
        </div>
      )}
      <div>
        {myMediaStream && (
          <video
            ref={myVideoBox}
            autoPlay
            playsInline
            muted
            style={{ width: "300px" }}
          />
        )}
        {theirMediaStream && (
          <video
            ref={theirVideoBox}
            autoPlay
            playsInline
            style={{ width: "300px" }}
          />
        )}
      </div>
    </div>
  );
}

export default ConnectUser;
