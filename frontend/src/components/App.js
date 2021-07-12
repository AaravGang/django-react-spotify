import React, { useState } from "react";
import { render } from "react-dom";
import HomePage from "./HomePage";
import AlertDismissible from "./AlertDismissible";

export default function App() {
  const [alertParams, setAlertParams] = useState({
    text: "",
    show: false,
    bgColor: "",
  });
  return (
    <div>
      {alertParams.show ? (
        <AlertDismissible
          text={alertParams.text}
          show={alertParams.show}
          variant={alertParams.bgColor}
          setParams={setAlertParams}
        />
      ) : null}
      <div className="center">
        <HomePage setAlertParams={setAlertParams} />
      </div>
    </div>
  );
}

const appDiv = document.getElementById("app");
render(<App />, appDiv);
