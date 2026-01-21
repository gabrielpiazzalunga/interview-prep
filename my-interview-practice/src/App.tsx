// App.tsx
import React, { useState, useReducer, useEffect, useRef } from 'react';
import './App.css';
import Button from './components/Button';
import { uiReducer, initialUIState } from './store/uiReducer';
import { callAnilistStudio } from './services/graphql';

function App() {
  const [count, setCount] = useState(0);
  const [uiState, uiDispatch] = useReducer(uiReducer, initialUIState);
  const [isSaving, setIsSaving] = useState(false);
  const prevDisableRef = useRef(uiState.disableButtons);
  const prevCountRef = useRef(count);
  const countTimeoutRef = useRef<number | null>(null);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
  };

  const handleReset = () => {
    setCount(0);
  };

  const toggleDisabled = () => {
    uiDispatch({ type: 'TOGGLE_DISABLE' });
  };

  useEffect(() => {
    // skip calling service on initial render
    if (prevDisableRef.current === uiState.disableButtons) {
      prevDisableRef.current = uiState.disableButtons;
      return;
    }

    let mounted = true;

    setIsSaving(true);

    callAnilistStudio()
      .then(success => {
        if (!mounted) return;
        if (!success) {
          // revert to previous state on failure
          uiDispatch({ type: 'SET_DISABLE', payload: prevDisableRef.current });
        }
      })
      .catch(err => {
        console.error('AniList request failed:', err);
        uiDispatch({ type: 'SET_DISABLE', payload: prevDisableRef.current });
      })
      .finally(() => {
        if (mounted) setIsSaving(false);
        prevDisableRef.current = uiState.disableButtons;
      });

    return () => {
      mounted = false;
    };
  }, [uiState.disableButtons]);

  // Call AniList when `count` changes (debounced).
  useEffect(() => {
    if (prevCountRef.current === count) {
      prevCountRef.current = count;
      return;
    }

    // debounce rapid increments
    if (countTimeoutRef.current) {
      window.clearTimeout(countTimeoutRef.current);
    }

    countTimeoutRef.current = window.setTimeout(() => {
      let mounted = true;
      setIsSaving(true);

      callAnilistStudio()
        .then(success => {
          if (!mounted) return;
          if (!success) {
            console.warn('AniList call returned unsuccessful response for count change');
          }
        })
        .catch(err => {
          console.error('AniList call failed on count change:', err);
        })
        .finally(() => {
          if (mounted) setIsSaving(false);
          prevCountRef.current = count;
        });

      // cleanup guard when effect is torn down while request is in flight
      return () => {
        mounted = false;
      };
    }, 300);

    return () => {
      if (countTimeoutRef.current) {
        window.clearTimeout(countTimeoutRef.current);
        countTimeoutRef.current = null;
      }
    };
  }, [count]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Counter App</h1>
        
        <div className="counter-display">
          <h2>Count: {count}</h2>
        </div>

        <div className="button-group">
          <Button
            text={`Increment (${count})`}
            onClick={handleIncrement}
            type="primary"
            disabled={uiState.disableButtons}
            ariaLabel={`Increment counter. Current count: ${count}`}
          />
          
          <Button
            text="Reset Counter"
            onClick={handleReset}
            type="secondary"
            disabled={uiState.disableButtons}
            ariaLabel="Reset counter to zero"
          />
          
          <Button
            text={uiState.disableButtons ? "Enable Buttons" : "Disable Buttons"}
            onClick={toggleDisabled}
            type={uiState.disableButtons ? "primary" : "danger"}
            ariaLabel={uiState.disableButtons ? "Enable all buttons" : "Disable all buttons"}
          />
          <Button
            text={"Count Animes Buttons"}
            onClick={toggleDisabled}
            type={"primary"}
            disabled={uiState.disableButtons}
          />
        </div>

        <div className="accessibility-note">
          <p>✅ Accessibility features implemented:</p>
          <ul>
            <li>ARIA labels for screen readers</li>
            <li>Keyboard navigation support</li>
            <li>Focus indicators</li>
            <li>Disabled state handling</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;