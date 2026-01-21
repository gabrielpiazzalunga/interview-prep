export type UIState = {
  disableButtons: boolean;
};

export type UIAction =
  | { type: 'TOGGLE_DISABLE' }
  | { type: 'SET_DISABLE'; payload: boolean };

export const initialUIState: UIState = { disableButtons: false };

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_DISABLE':
      return { ...state, disableButtons: !state.disableButtons };
    case 'SET_DISABLE':
      return { ...state, disableButtons: action.payload };
    default:
      return state;
  }
}
