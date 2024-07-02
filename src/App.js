import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messagesQueue, setMessagesQueue] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("No messages yet...");
  const [countdown, setCountdown] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:5000");
    ws.current.onopen = () => {
      console.log("WebSocket connection established");
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessagesQueue((prevQueue) => [...prevQueue, data.latestMessage]);
    };
    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (countdown === null && messagesQueue.length > 0) {
      setCountdown(5);
    }

    if (countdown !== null && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    }

    if (countdown === 0) {
      setCurrentMessage(messagesQueue[0]);
      setMessagesQueue((prevQueue) => prevQueue.slice(1));
      setCountdown(null);
    }
  }, [countdown, messagesQueue]);

  useEffect(() => {
    if (messagesQueue.length > 0 && countdown === null) {
      setCountdown(5);
    }
  }, [messagesQueue, countdown]);

  return (
    <div className="App">
      <div id="message-container">
        <div id="message">{currentMessage}</div>
        {countdown !== null && (
          <div id="countdown">New message in {countdown}</div>
        )}
      </div>
    </div>
  );
}

export default App;
