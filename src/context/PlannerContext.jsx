import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react';

const PlannerContext = createContext(null);

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createInitialState() {
  const rawTrips = readStorage('trips', []);
  const trips = Array.isArray(rawTrips) ? rawTrips.map((trip, index) => {
    if (typeof trip === 'string') {
      return {
        id: `saved-${index}-${trip.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        title: trip,
        destination: trip,
        startDate: '',
        endDate: '',
        budget: 0,
        activities: [],
        expenses: [],
        createdAt: new Date().toISOString(),
      };
    }
    return { activities: [], expenses: [], budget: 0, ...trip, id: trip.id ?? createId() };
  }) : [];
  return {
    trips,
    wishlist: readStorage('wishlist', []),
    preferences: { theme: 'light', ...readStorage('preferences', {}) },
  };
}

function updateTrip(state, tripId, updater) {
  return { ...state, trips: state.trips.map((trip) => trip.id === tripId ? updater(trip) : trip) };
}

function plannerReducer(state, action) {
  switch (action.type) {
    case 'CREATE_TRIP': return { ...state, trips: [action.trip, ...state.trips] };
    case 'UPDATE_TRIP': return updateTrip(state, action.tripId, (trip) => ({ ...trip, ...action.updates }));
    case 'DELETE_TRIP': return { ...state, trips: state.trips.filter((trip) => trip.id !== action.tripId) };
    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.includes(action.destinationId);
      return { ...state, wishlist: exists ? state.wishlist.filter((id) => id !== action.destinationId) : [...state.wishlist, action.destinationId] };
    }
    case 'SET_THEME': return { ...state, preferences: { ...state.preferences, theme: action.theme } };
    case 'ADD_ACTIVITY': return updateTrip(state, action.tripId, (trip) => ({ ...trip, activities: [...trip.activities, action.activity] }));
    case 'UPDATE_ACTIVITY': return updateTrip(state, action.tripId, (trip) => ({ ...trip, activities: trip.activities.map((activity) => activity.id === action.activityId ? { ...activity, ...action.updates } : activity) }));
    case 'DELETE_ACTIVITY': return updateTrip(state, action.tripId, (trip) => ({ ...trip, activities: trip.activities.filter((activity) => activity.id !== action.activityId) }));
    case 'REORDER_ACTIVITIES': return updateTrip(state, action.tripId, (trip) => ({ ...trip, activities: action.activities }));
    case 'ADD_EXPENSE': return updateTrip(state, action.tripId, (trip) => ({ ...trip, expenses: [...trip.expenses, action.expense] }));
    case 'DELETE_EXPENSE': return updateTrip(state, action.tripId, (trip) => ({ ...trip, expenses: trip.expenses.filter((expense) => expense.id !== action.expenseId) }));
    default: return state;
  }
}

export function PlannerProvider({ children }) {
  const [state, dispatch] = useReducer(plannerReducer, undefined, createInitialState);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('trips', JSON.stringify(state.trips));
      localStorage.setItem('wishlist', JSON.stringify(state.wishlist));
      localStorage.setItem('preferences', JSON.stringify(state.preferences));
    } catch {
      // Keep the planner usable when browser storage is unavailable.
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
  }, [state.preferences.theme]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = useCallback((message, type = 'success') => {
    setToast({ id: createId(), message, type });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const value = {
    ...state,
    dispatch,
    toast,
    notify,
    createId,
    toggleTheme: () => dispatch({ type: 'SET_THEME', theme: state.preferences.theme === 'dark' ? 'light' : 'dark' }),
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner must be used inside PlannerProvider');
  return context;
}