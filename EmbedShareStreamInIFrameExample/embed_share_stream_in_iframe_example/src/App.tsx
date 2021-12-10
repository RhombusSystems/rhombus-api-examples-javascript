import React from "react";
import "./App.css";

function App() {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <iframe
        title={"Shared Stream"}
        src="https://console.rhombussystems.com/share/live/antgp6yFTK-Vnkg-fpBWRQ"
        allow="fullscreen"
        width="960"
        height="569"
        style={{ flex: 1 }}
      />
    </div>
  );
}

export default App;
