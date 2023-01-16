import React from "react";
import ReactDOM from "react-dom";

import App from "./App.js";

import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import interfaceReducer from "./features/interfaces";
import toggleReducer from "./features/toggle";
import voiceReducer from "./features/voice";

const store = configureStore({
  reducer: {
    interfaces: interfaceReducer,
    toggle: toggleReducer,
    voice: voiceReducer,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
