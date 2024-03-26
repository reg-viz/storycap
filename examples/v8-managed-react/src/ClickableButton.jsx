import React, { useState } from 'react';

const ClickableButton = () => {
  const [counter, setCounter] = useState(0);
  return (
    <button className="clickable" onClick={() => setCounter(counter + 1)}>
      Clicked: {counter}
    </button>
  );
};

export default ClickableButton;
