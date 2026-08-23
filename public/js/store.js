/**
 * State management sederhana tanpa framework.
 * Satu "state" jadi sumber kebenaran, tiap kali berubah,
 * semua yang subscribe dikasih tau buat render ulang.
 */
function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  function getState() {
    return state;
  }

  function setState(partialState) {
    state = { ...state, ...partialState };
    listeners.forEach((listener) => listener(state));
  }

  function subscribe(listener) {
    listeners.push(listener);
  }

  return { getState, setState, subscribe };
}
