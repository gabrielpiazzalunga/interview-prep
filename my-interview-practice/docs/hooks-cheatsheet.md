# Hooks Cheatsheet

Small snippets for quick notes: `useState`, `useEffect`, `useRef`, and `forwardRef`/`useImperativeHandle` examples.

## useState
```tsx
import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
```

## useEffect
- Runs after render. Include dependencies used inside.

```tsx
import React, { useEffect, useState } from 'react';

function Example({ id }: { id: number }) {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('https://graphql.anilist.co/', { method: 'POST', /* ... */ })
      .then(r => r.json())
      .then(json => { if (mounted) setName(json.data?.Studio?.name ?? null); })
      .catch(() => { if (mounted) setName(null); });

    return () => { mounted = false; };
  }, [id]); // triggers when `id` changes

  return <div>{name ?? 'Loading...'}</div>;
}
```

### Advanced: watch state and perform async (with AbortController)

```tsx
import React, { useEffect, useState } from 'react';

function Search({ query }: { query: string }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) { setResults([]); return; }

    const controller = new AbortController();
    const signal = controller.signal;

    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch('https://graphql.anilist.co/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `query { Page(perPage:5) { media(search: \"${query}\") { id title { romaji } } } }` }),
          signal,
        });
        const json = await res.json();
        if (!mounted) return;
        setResults(json.data?.Page?.media ?? []);
      } catch (err) {
        if (err.name === 'AbortError') return; // expected on cancel
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort(); // cancel inflight request
    };
  }, [query]);

  return (
    <div>
      {loading ? <p>Loading...</p> : <ul>{results.map(r => <li key={r.id}>{r.title?.romaji}</li>)}</ul>}
    </div>
  );
}
```

This pattern: watch `query` in deps, use `AbortController` for cancellation, guard with `mounted` to avoid state updates after unmount.

### Subscribing to changes in a child component

Common patterns to receive notifications when a child changes internal state:

- Callback prop (recommended): child calls `onChange` whenever its internal state updates; parent handles it and can subscribe via `useEffect` if needed.

Child:
```tsx
function ChildNotifier({ onChange }: { onChange: (v:string) => void }){
  const [text, setText] = useState('');
  useEffect(() => { onChange(text); }, [text, onChange]);
  return <input value={text} onChange={e => setText(e.target.value)} />;
}
```

Parent (subscribe inside an effect):
```tsx
function Parent(){
  const [last, setLast] = useState('');
  const handle = (v:string) => setLast(v);
  // if you need to react to changes with side-effects, useEffect watching `last`
  useEffect(() => { console.log('child changed:', last); }, [last]);
  return <ChildNotifier onChange={handle} />;
}
```

- Imperative subscription via `forwardRef` (alternative): child exposes `subscribe(cb)` method; parent calls it in `useEffect` and returns an unsubscribe.

Child exposing subscription:
```tsx
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';

const SubscribingChild = forwardRef((_, ref) => {
  const [value, setValue] = useState('');
  const listeners = useRef(new Set<(v:string)=>void>());

  useImperativeHandle(ref, () => ({
    subscribe: (cb: (v:string)=>void) => {
      listeners.current.add(cb);
      return () => listeners.current.delete(cb);
    }
  }), []);

  // notify listeners whenever value changes
  React.useEffect(() => { listeners.current.forEach(cb => cb(value)); }, [value]);

  return <input value={value} onChange={e => setValue(e.target.value)} />;
});
```

Parent using subscription:
```tsx
function ParentSub(){
  const ref = useRef<any>(null);
  useEffect(() => {
    if (!ref.current) return;
    const unsub = ref.current.subscribe((v:string) => console.log('child ->', v));
    return unsub;
  }, [ref.current]);
  return <SubscribingChild ref={ref} />;
}
```

Notes: callback props are simpler and easier to test; imperative subscribe is useful when child needs to manage multiple listeners or when you integrate with external APIs, but it's more complex.


## useRef
- DOM ref and mutable value container (doesn't cause re-renders).

```tsx
import React, { useRef, useEffect } from 'react';

function FocusInput() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  return <input ref={inputRef} />;
}
```

## forwardRef + useImperativeHandle (child and parent example)

Child component (exposes `focus()` and `reset()`):

```tsx
// src/components/ImperativeInput.tsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export type ImperativeInputHandle = { focus: () => void; reset: () => void };

const ImperativeInput = forwardRef<ImperativeInputHandle, {}>((_, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    reset: () => { if (inputRef.current) inputRef.current.value = ''; }
  }), []);

  return <input ref={inputRef} placeholder="type..." />;
});

export default ImperativeInput;
```

Parent component (calls methods on child):

```tsx
// src/pages/ParentExample.tsx
import React, { useRef } from 'react';
import ImperativeInput, { ImperativeInputHandle } from '../components/ImperativeInput';

export default function ParentExample() {
  const childRef = useRef<ImperativeInputHandle | null>(null);

  return (
    <div>
      <ImperativeInput ref={childRef} />
      <button onClick={() => childRef.current?.focus()}>Focus child</button>
      <button onClick={() => childRef.current?.reset()}>Reset child</button>
    </div>
  );
}
```

## Alternatives for child ⇄ parent communication
- Props callbacks (lift state up): parent passes `onChange` / `onEvent` functions to child.
- Controlled components: parent owns state and passes `value` + `onChange`.
- React Context: share state or dispatch across many nested components.
- Global state (Redux / Zustand / recoil): for app-wide shared state.
- Events / Observables: custom event emitter or RxJS for decoupled communication.
- Refs + callback refs: parent passes a callback ref to get node or call a setup function.
- Portals + centralized manager: for modals/overlays where parent registers handlers.

### Examples: parent ⇄ child patterns

1) Props callbacks (lift state up)

Child:
```tsx
// Child.tsx
import React from 'react';

export default function Child({ onChange }: { onChange: (v: string) => void }) {
  return (
    <input
      onChange={e => onChange(e.target.value)}
      placeholder="type to notify parent"
    />
  );
}
```

Parent:
```tsx
// Parent.tsx
import React, { useState } from 'react';
import Child from './Child';

export default function Parent() {
  const [value, setValue] = useState('');
  return (
    <div>
      <Child onChange={v => setValue(v)} />
      <p>Child value: {value}</p>
    </div>
  );
}
```

2) Controlled components

Child (controlled):
```tsx
// ControlledInput.tsx
import React from 'react';

export default function ControlledInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}
```

Parent:
```tsx
import React, { useState } from 'react';
import ControlledInput from './ControlledInput';

export default function ParentControlled() {
  const [text, setText] = useState('hello');
  return <ControlledInput value={text} onChange={setText} />;
}
```

3) React Context (share state/dispatch across deep tree)

Create context + provider:
```tsx
// counterContext.tsx
import React, { createContext, useContext, useReducer } from 'react';

type State = { count: number };
type Action = { type: 'inc' | 'dec' };

const CounterContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
    default: return state;
  }
}

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return <CounterContext.Provider value={{ state, dispatch }}>{children}</CounterContext.Provider>;
}

export function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error('useCounter must be used within CounterProvider');
  return ctx;
}
```

Usage in child components:
```tsx
// CounterDisplay.tsx
import React from 'react';
import { useCounter } from './counterContext';

export default function CounterDisplay() {
  const { state, dispatch } = useCounter();
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
    </div>
  );
}
```

Wrap app:
```tsx
// root
import React from 'react';
import { CounterProvider } from './counterContext';
import App from './App';

export default function Root() {
  return (
    <CounterProvider>
      <App />
    </CounterProvider>
  );
}
```

4) Redux (final example — parent/child using global store)

Simple Redux slice and usage:

Store slice:
```ts
// store/counterSlice.ts
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; }
  }
});

export const { increment, decrement } = counterSlice.actions;
export const store = configureStore({ reducer: { counter: counterSlice.reducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Provider in root:
```tsx
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/counterSlice';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}><App /></Provider>
);
```

Parent/child components using Redux hooks:
```tsx
// ParentRedux.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/counterSlice';
import { increment } from '../store/counterSlice';

export default function ParentRedux() {
  const count = useSelector((s: RootState) => s.counter.value);
  const dispatch = useDispatch();
  return (
    <div>
      <p>Count (from Redux): {count}</p>
      <button onClick={() => dispatch(increment())}>Increment (global)</button>
    </div>
  );
}
```

Child can also `useSelector` / `useDispatch` to read/update the same global state — no props drilling required.

## Tips
- Prefer declarative props for predictable UI; use imperative handles sparingly for focus, scroll, or interop.
- For useEffect dependencies: include every variable used inside the effect (stabilize functions with `useCallback`).
- Use `useRef` for mutable counters or storing previous values without re-rendering.

---
File created for quick interview notes.

## Recommendations & Trade-offs

- **Start simple:** prefer `props` callbacks and controlled components for local interactions — minimal boilerplate and easiest to test.
- **When to use Context:** introduce `React Context` for medium-scope sharing (themes, auth, UI slices) to avoid prop drilling. Trade-off: can cause broader re-renders; scope contexts tightly.
- **When to use global state:** adopt Redux / Zustand / Recoil for app-wide state, complex caching, or cross-cutting updates. Trade-off: more setup and cognitive overhead, but gains in tooling and predictable flows.
- **Use forwardRef/useImperativeHandle sparingly:** expose a small imperative API (focus/open/scroll) only when UX or interop requires it. Trade-off: breaks pure-declarative flow and should be limited.
- **Refs & callback refs:** use for DOM access or third-party libraries; they don't trigger renders and require explicit update handling.
- **Events/Observables:** good for decoupled, pub/sub scenarios — powerful but harder to reason about and test.

Practical rules of thumb:
- Start with props + controlled inputs; if you face prop drilling, add a focused Context provider.
- Move to a global store only when multiple unrelated parts of the app must read/write the same state.
- Prefer declarative patterns; use imperative handles as escape hatches for focus/animation/interop.
- Optimize for performance by scoping context values, memoizing, and using selectors to avoid unnecessary re-renders.

## Higher-Order Components (HOC)

- **What:** A HOC is a function that takes a component and returns a new component with added behavior (a component-level decorator).
- **When useful:** cross-cutting concerns applied to many components (logging/analytics, authorization wrappers, data containers, feature flags).
- **Trade-offs:** adds indirection and wrapper stacks, complicates refs and static members; prefer hooks for logic reuse when possible.

### Best practices
- Preserve typings with generics, set a useful `displayName`, forward refs when needed, and hoist non-react statics if required.

### Small TypeScript example — `withLogger`
```tsx
import React from 'react';

function withLogger<P>(Wrapped: React.ComponentType<P>) {
  const WithLogger: React.FC<P> = (props: P) => {
    React.useEffect(() => {
      console.log('Mounted', Wrapped.displayName || Wrapped.name, props);
      return () => console.log('Unmounted', Wrapped.displayName || Wrapped.name);
    }, [props]);
    return <Wrapped {...props} />;
  };
  WithLogger.displayName = `WithLogger(${Wrapped.displayName || Wrapped.name || 'Component'})`;
  return WithLogger;
}

// Usage: const MyLoggedButton = withLogger(Button);
```

### Forwarding refs in HOCs
```tsx
import React from 'react';

function withForwardRef<P, R = any>(Wrapped: React.ComponentType<P>) {
  return React.forwardRef<R, P>((props, ref) => <Wrapped {...props} ref={ref as any} />);
}
```

### When to prefer alternatives
- Use custom hooks to reuse logic without changing component shape. Use Context for dependency injection across trees. Use HOCs when you need to return a wrapped component with added lifecycle or props.

## Other Hooks (quick reference)

1) `useContext` — consume a React Context value
- Description: read values from a Context created with `createContext`.
- Notes: cheap to use; prefer small, focused contexts to avoid wide re-renders.
- Example:
```tsx
const ThemeContext = React.createContext('light');
function Themed() {
  const theme = React.useContext(ThemeContext);
  return <div>Theme: {theme}</div>;
}
```

2) `useMemo` — memoize computed values
- Description: cache an expensive calculation result until deps change.
- Notes: use for expensive calculations or stable object/array identity; not for side-effects.
- Example:
```tsx
const expensive = React.useMemo(() => heavyCalc(items), [items]);
```

3) `useCallback` — memoize function references
- Description: returns a stable callback instance until deps change.
- Notes: useful to avoid re-rendering children that accept callbacks as props.
- Example:
```tsx
const onClick = React.useCallback(() => doThing(id), [id]);
```

4) `useReducer` — reducer-style state management
- Description: alternative to `useState` for complex state transitions.
- Notes: good for grouped updates and predictable state flows; pairs well with Context.
- Example:
```tsx
const [state, dispatch] = React.useReducer(reducer, { count: 0 });
dispatch({ type: 'increment' });
```

5) `useLayoutEffect` — run sync before paint
- Description: same signature as `useEffect` but fires synchronously after DOM mutations and before paint.
- Notes: use for measurements or to synchronously apply DOM changes to avoid flicker; avoid heavy work here.
- Example:
```tsx
React.useLayoutEffect(() => {
  const r = ref.current?.getBoundingClientRect();
  // adjust layout synchronously
}, []);
```

6) `useDebugValue` — show custom hook debug info in DevTools
- Description: annotate custom hooks with a value visible in React DevTools.
- Notes: no runtime effect; helpful when building reusable hooks.
- Example:
```tsx
function useCounter() {
  const [n, setN] = React.useState(0);
  React.useDebugValue(n > 5 ? 'big' : 'small');
  return [n, setN] as const;
}
```

7) `useId` — stable unique IDs
- Description: generate stable IDs for accessibility (labels, aria) that survive SSR/hydration.
- Notes: available in React 18+.
- Example:
```tsx
const id = React.useId();
return <label htmlFor={id}>Name<input id={id} /></label>;
```

8) `useTransition` & `useDeferredValue` — concurrent UI helpers
- Description: `useTransition` marks updates as non-urgent; `useDeferredValue` defers a value to keep UI responsive.
- Notes: useful for large lists, typeahead, or expensive rendering.
- Example:
```tsx
const [isPending, start] = React.useTransition();
start(() => setFilter(q));
const deferred = React.useDeferredValue(filter);
```

9) `useSyncExternalStore` — subscribe to external stores
- Description: recommended primitive for library authors to subscribe to external stores with SSR support.
- Notes: used by state libraries under the hood; rare for app-level usage.
- Example:
```tsx
const state = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

10) `useInsertionEffect` — inject styles before layout
- Description: runs before all other effects to insert styles (for CSS-in-JS libraries).
- Notes: very rare; intended for library authors to avoid FOUC.
- Example:
```tsx
React.useInsertionEffect(() => { /* insert stylesheet */ }, []);
```

---
Add these examples to the cheatsheet to cover common and advanced hooks.


