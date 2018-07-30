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
    function proxy(...args) {
      const result = mapDispatchToProps(...args);
      return { ...props, ...result };
    }
    (proxy as any).dependsOnOwnProps = mapDispatchToProps.dependsOnOwnProps;
    return wrapMapToPropsFunc(proxy, 'mapDispatchToProps');
  }

  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    if (Boolean(mapDispatchToProps)) {
      return;
    }
    return wrapMapToPropsConstant(dispatch => ({ dispatch, ...props }));
  }

  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    if (mapDispatchToProps && typeof mapDispatchToProps === 'object') {
      return wrapMapToPropsConstant(dispatch =>
        ({ dispatch, ...bindActionCreators(mapDispatchToProps, dispatch), ...props })
      );
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
