import {
  SelectorFactory,
  AdvancedComponentDecorator,
  MapStateToPropsFactory,
  MapDispatchToPropsFactory,
} from 'react-redux';
import { createConnect as create } from 'react-redux/lib/connect/connect';
import { bindActionCreators } from 'redux';
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from 'react-redux/lib/connect/wrapMapToProps';

interface Options {
  props: any
}

function createDefaultMapDispatchToPropsFactories ({ props }: Options) {
  function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    if (typeof mapDispatchToProps !== 'function') {
      return;
    }
    const injectFunction = (dispatch, { displayName }) => (stateOrDispatch, ownProps) => {
      const origin = wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps')(dispatch, { displayName })(stateOrDispatch, ownProps);
      return origin;
    }
    return injectFunction;
  }

  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    if (Boolean(mapDispatchToProps)) {
      return;
    }
    const injectFunction = (dispatch, { displayName }) => (stateOrDispatch, ownProps) => {
      const origin = wrapMapToPropsConstant(dispatch => ({ dispatch }))(dispatch, { displayName })(stateOrDispatch, ownProps);
      return origin;
    }
    return injectFunction;
  }

  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    if (mapDispatchToProps && typeof mapDispatchToProps === 'object') {
      const injectFunction = (dispatch, { displayName }) => (stateOrDispatch, ownProps) => {
        const origin =  wrapMapToPropsConstant(dispatch => bindActionCreators(mapDispatchToProps, dispatch))(dispatch, { displayName })(stateOrDispatch, ownProps);
        return origin;
      }
      return injectFunction;
    }
    return;
  }

  const defaultMapDispatchToPropsFactories = [
    whenMapDispatchToPropsIsFunction,
    whenMapDispatchToPropsIsMissing,
    whenMapDispatchToPropsIsObject
  ]
  return defaultMapDispatchToPropsFactories;
}

interface createConnectOptions {
  connectHOC?: AdvancedComponentDecorator<any, any>;
  mapStateToPropsFactories?: MapStateToPropsFactory<any, any, any>;
  mapDispatchToPropsFactories?: MapDispatchToPropsFactory<any, any>;
  mergePropsFactories?: any;
  selectorFactory?: SelectorFactory<any, any, any, any>;
  props?: any;
}

export function createConnect({
  props,
  ...options
}: createConnectOptions = {}) {
  return create({
    mapDispatchToPropsFactories: createDefaultMapDispatchToPropsFactories({
      props
    }),
    ...options,
  })
}

export const connect = createConnect();
