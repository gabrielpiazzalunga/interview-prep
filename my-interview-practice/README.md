# Quick Guide: Routing, Components, Hooks, and Reducer State

This README gives concise, practical examples so you can explore routing, creating components, using hooks, and managing state with a reducer in this React + TypeScript app.

**What I added**
- Example components: `src/examples/RouterExample.tsx`, `src/examples/HooksExample.tsx`, `src/examples/CounterReducer.tsx`
- Explanations and copy-paste snippets below so you can try them quickly.

**Note:** the examples use `react-router-dom` (v6). Install it before using the router example:

```bash
npm install react-router-dom
# If you use older versions of react-router-dom and need types:
npm install -D @types/react-router-dom
```

**Run the app**

```bash
npm start
```

**1) How routing works (overview)**
- Routing maps URL paths to React components. The popular library is `react-router-dom`.
- The router watches the browser location and renders the matching `Route`.

Small example (see `src/examples/RouterExample.tsx`):

```tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';

export default function RouterExample() {
	return (
		<BrowserRouter>
			<nav>
				<Link to="/">Home</Link> | <Link to="/about">About</Link>
			</nav>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</BrowserRouter>
	);
}
```

To try it: import `RouterExample` into `src/App.tsx` and render it instead of the default content.

**2) How to create a new component**
- Create a file under `src/components` or `src/pages`.
- Export a function component.

Example file `src/pages/Home.tsx`:

```tsx
import React from 'react';

export default function Home() {
	return <h2>Home</h2>;
}
```

Then import and use it: `import Home from './pages/Home'`.

**3) Using Hooks (small examples)**
- `useState` holds local component state.
- `useEffect` runs side-effects.

See `src/examples/HooksExample.tsx` for a combined example.

Quick snippet:

```tsx
import React, { useState, useEffect } from 'react';

export default function HooksExample() {
	const [count, setCount] = useState(0);

	useEffect(() => {
		document.title = `Count: ${count}`;
	}, [count]);

	return (
		<div>
			<p>Count: {count}</p>
			<button onClick={() => setCount(c => c + 1)}>Increment</button>
		</div>
	);
}
```

**4) State management with `useReducer` (concept + diagram)**
- `useReducer` is like a local Redux-style reducer: state and dispatch. Good for complex state transitions.
- Shape: `const [state, dispatch] = useReducer(reducer, initialState)`

Diagram (simple flow):

```
			User interaction
					 |
					 v
				Component ---dispatch--> reducer(action) ---returns--> new state
					 ^                                         |
					 |-----------------------------------------|
									(component re-renders with state)
```

Reducer example (see `src/examples/CounterReducer.tsx`):

```tsx
import React, { useReducer } from 'react';

type State = { count: number };
type Action = { type: 'increment' | 'decrement' | 'reset' };

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
		<div>
			<p>Count: {state.count}</p>
			<button onClick={() => dispatch({ type: 'decrement' })}>-</button>
			<button onClick={() => dispatch({ type: 'reset' })}>reset</button>
			<button onClick={() => dispatch({ type: 'increment' })}>+</button>
		</div>
	);
}
```

When to lift reducer to context:
- If multiple components across the app must read/modify the same reducer state, create a React Context that provides `[state, dispatch]` and wrap your app with it.

Minimal wiring steps:
1. Create `StoreContext` with `React.createContext<...>(undefined!)` and a provider component that uses `useReducer` and returns `<StoreContext.Provider value={{state, dispatch}}>`.
2. Wrap the app (e.g., in `src/index.tsx`) with the provider.
3. Consume the context using `useContext(StoreContext)` or create a custom hook `useStore()`.

**Example install & run commands**

```bash
# install router
npm install react-router-dom

# start dev server
npm start
```

**Files added**
- `src/examples/RouterExample.tsx` — router example you can import into `App.tsx`.
- `src/examples/HooksExample.tsx` — `useState` + `useEffect` demo.
- `src/examples/CounterReducer.tsx` — `useReducer` demo.

If you'd like, I can also:
- Wire one example into `src/App.tsx` and update `src/index.tsx` to mount the router/provider.
- Add a small `StoreContext` provider example and show how to consume it across pages.

Tell me which of those you'd like me to apply.
