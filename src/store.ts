// src/store.ts
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import keplerGlReducer from '@kepler.gl/reducers';
import { taskMiddleware } from 'react-palm/tasks';
import { SYRIA_MAP_STATE } from './constants/syriaMapConfig';

const rootReducer = combineReducers({
  keplerGl: keplerGlReducer.initialState({
    mapState: SYRIA_MAP_STATE,
    uiState: {
      // Prevent the "Add Data To Map" modal from auto-opening
      activeSidePanel: null,
      currentModal: null,
      readOnly: false
    }
  })
});

const enhancers = compose(applyMiddleware(taskMiddleware as any));
export const store = createStore(rootReducer, {}, enhancers);
