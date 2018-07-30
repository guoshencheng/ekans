import { Middleware } from 'redux'

function createThunkMiddleware(extraArgument?: any): Middleware {
  return ({ dispatch, getState }) => (next: Function) => (action: any) => {
  if (typeof action === 'function') {
      return action(extraArgument, dispatch, getState);
    }
    return next(action);
  };
}

const thunk = createThunkMiddleware() as any;
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
