import React, { useState, useEffect } from 'react';

export default function HooksExample() {
  const [count, setCount] = useState<number>(0);
  const [name, setName] = useState<string>('Guest');

  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  return (
    <div style={{ padding: 16 }}>
      <h3>Hooks Example</h3>
      <p>
        Hello, {name}. You clicked <strong>{count}</strong> times.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setCount(c => c + 1)}>Increment</button>
        <button onClick={() => setCount(c => c - 1)}>Decrement</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <label>
          Your name: <input value={name} onChange={e => setName(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
