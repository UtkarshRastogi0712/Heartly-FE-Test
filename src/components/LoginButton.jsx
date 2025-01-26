import React, { useState } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";

function LoginButton() {
  const [walletAddress, setWalletAddress] = useState("");
  const [jwtToken, setJwtToken] = useState("");

  const handleLogin = async () => {
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        const address = signer.address;

        const domain = window.location.host;
        const origin = window.location.origin;
        setWalletAddress(address);
        console.log(address, domain, origin);
        // Fetch nonce from backend
        const nonceResponse = await fetch(
          "http://localhost:8000/auth/request-nonce",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ walletAddress: address }),
          },
        );

        const nonceData = await nonceResponse.json();
        const nonce = nonceData.nonce;

        console.log("Nonce:", nonce);
        // Create message to sign
        const messageShell = new SiweMessage({
          domain,
          address,
          nonce,
          uri: origin,
          version: "1",
          chainId: "1",
        });
        const message = messageShell.prepareMessage();

        // Sign the message
        const signature = await signer.signMessage(message);
        console.log("Message:", signature);

        // Send signature to backend for verification
        const verifyResponse = await fetch(
          "http://localhost:8000/auth/verify-signature",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress: address,
              signature,
              message,
            }),
          },
        );

        const verifyData = await verifyResponse.json();

        if (verifyData.token) {
          setJwtToken(verifyData.token);
          localStorage.setItem("token", `Bearer ${verifyData.token}`);
          alert("Login successful!");
        } else {
          alert("Login failed!");
        }
      } else {
        alert("MetaMask is not installed!");
      }
    } catch (error) {
      console.error("Error logging in with MetaMask:", error);
      alert("Error logging in. Check console for details.");
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with metamask</button>
    </div>
  );
}

export default LoginButton;
