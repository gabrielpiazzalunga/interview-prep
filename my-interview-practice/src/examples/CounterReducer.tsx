import React, { useReducer } from 'react';

type State = { count: number };

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

export default function CounterReducer() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div style={{ padding: 16 }}>
      <h3>Counter (useReducer)</h3>
      <p>Count: {state.count}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
        <button onClick={() => dispatch({ type: 'reset' })}>reset</button>
        <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      </div>
    </div>
  );
}
