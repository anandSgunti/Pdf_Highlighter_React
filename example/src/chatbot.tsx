import React, { useState } from 'react';
import './style/chat.css'; // Ensure this contains the updated CSS
import logo from './style/logo.png'

const SidebarComponent = () => {
  const [isVisible, setIsVisible] = useState(false); // Track sidebar visibility

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Floating toggle button with PNG logo */}
      <button className="chatbot-toggle-button" onClick={toggleSidebar}>
        <img src={logo} alt="Open Chatbot" className="chatbot-logo" />
      </button>


      {/* Chatbot sidebar */}
      <div className={`sidebar1 ${isVisible ? "visible" : ""}`}>
        <iframe
          src="https://medbot.azurewebsites.net/"
          title="Chatbot"
          className="chatbot-frame"
        ></iframe>
      </div>
    </>
  );
};

export default SidebarComponent;
