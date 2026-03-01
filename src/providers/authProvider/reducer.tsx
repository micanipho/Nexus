import { handleActions } from 'redux-actions';
import { 
  AUTH_LOGIN_REQUEST, 
  AUTH_LOGIN_SUCCESS, 
  AUTH_LOGIN_FAILURE, 
  AUTH_REGISTER_REQUEST,
  AUTH_REGISTER_SUCCESS,
  AUTH_REGISTER_FAILURE,
  AUTH_LOGOUT,
  AUTH_SET_USER 
} from './actions';
import { AuthState, initialState } from './context';

const authReducer = handleActions<AuthState, any>(
  {
    [AUTH_LOGIN_REQUEST]: (state) => ({
      ...state,
      loading: true,
      error: null,
    }),
    [AUTH_LOGIN_SUCCESS]: (state, action) => ({
      ...state,
      loading: false,
      isAuthenticated: true,
      user: action.payload.user,
      token: action.payload.token,
      error: null,
    }),
    [AUTH_LOGIN_FAILURE]: (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
      isAuthenticated: false,
      user: null,
      token: null,
    }),
    [AUTH_REGISTER_REQUEST]: (state) => ({
      ...state,
      loading: true,
      error: null,
    }),
    [AUTH_REGISTER_SUCCESS]: (state, action) => ({
      ...state,
      loading: false,
      isAuthenticated: true,
      user: action.payload.user,
      token: action.payload.token,
      error: null,
    }),
    [AUTH_REGISTER_FAILURE]: (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
      isAuthenticated: false,
      user: null,
      token: null,
    }),
    [AUTH_LOGOUT]: () => ({
      ...initialState,
      loading: false,
    }),
    [AUTH_SET_USER]: (state, action) => ({
      ...state,
      user: action.payload,
      isAuthenticated: !!action.payload,
      loading: false,
    }),
  },
  initialState
);

export default authReducer;
