import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");

  const handleClick = (value) => {
    setInput((prev) => prev + value);
  };

  const handleClear = () => {
    setInput("");
  };

  const handleCalculate = () => {
    try {
      setInput(eval(input).toString());
    } catch {
      setInput("Error");
    }
  };

  return (
    <div className="calculator">
      <input type="text" value={input} readOnly className="display" />
      <div className="buttons">
        {["7", "8", "9", "÷", "4", "5", "6", "x", "1", "2", "3", "-", "0", ".", "=", "+"].map(
          (char) => (
            <button
              key={char}
              onClick={() => (char === "=" ? handleCalculate() : handleClick(char))}
              className="btn"
            >
              {char}
            </button>
          )
        )}
        <button onClick={handleClear} className="btn clear">Clear</button>
      </div>
    </div>
  );
}

export default App;
