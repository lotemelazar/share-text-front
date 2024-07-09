import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { DarkModeSwitch } from "react-toggle-dark-mode";

function App() {
  const [messagesQueue, setMessagesQueue] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("No messages yet...");
  const [countdown, setCountdown] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // Set dark mode as default
  const ws = useRef(null);

  useEffect(() => {
    // ws.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_TEST_URL);
    ws.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL); // Use custom environment variable
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

  const isHebrew = (text) => {
    return /[\u0590-\u05FF]/.test(text);
  };

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
  }, [darkMode]);

  return (
    <div className={`App`}>
      <div className="toggle-container">
        <DarkModeSwitch checked={darkMode} onChange={setDarkMode} size={30} />
      </div>
      <div id="message-container">
        <div
          id="message"
          style={{ direction: isHebrew(currentMessage) ? "rtl" : "ltr" }}>
          {currentMessage}
        </div>
        {countdown !== null && (
          <div id="countdown">New message in {countdown}</div>
        )}
      </div>
    </div>
  );
}

export default App;
