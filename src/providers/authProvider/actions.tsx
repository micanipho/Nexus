import { createAction } from 'redux-actions';
import { User } from '@/types';

export const AUTH_LOGIN_REQUEST = 'AUTH_LOGIN_REQUEST';
export const AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS';
export const AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE';
export const AUTH_REGISTER_REQUEST = 'AUTH_REGISTER_REQUEST';
export const AUTH_REGISTER_SUCCESS = 'AUTH_REGISTER_SUCCESS';
export const AUTH_REGISTER_FAILURE = 'AUTH_REGISTER_FAILURE';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';
export const AUTH_SET_USER = 'AUTH_SET_USER';

export const authLoginRequest = createAction(AUTH_LOGIN_REQUEST);
export const authLoginSuccess = createAction<{ user: User; token: string }>(AUTH_LOGIN_SUCCESS);
export const authLoginFailure = createAction<string>(AUTH_LOGIN_FAILURE);
export const authRegisterRequest = createAction(AUTH_REGISTER_REQUEST);
export const authRegisterSuccess = createAction<{ user: User; token: string }>(AUTH_REGISTER_SUCCESS);
export const authRegisterFailure = createAction<string>(AUTH_REGISTER_FAILURE);
export const authLogout = createAction(AUTH_LOGOUT);
export const authSetUser = createAction<User | null>(AUTH_SET_USER);
