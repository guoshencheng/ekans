import * as React from 'react';
import { Provider } from 'react-redux';
import * as ReactDOMServer from 'react-dom/server';

import {
  App,
  Model,
  MapModelDispatchBindedAction,
  ModelDispatchBindedAction,
  createConnect
} from '../src';

type AState = {
  a: string,
  b: string
}

type BState = {
  c: string,
  d: string[]
}

type CState = {
  A: AState,
  B: BState,
}

const A = new Model<AState>({
  defaultState: {
    a: 'a',
    b: 'b',
  },
  handlers: {
    CHANGE_A(state: AState, a: string) {
      return { ...state, a };
    },
    CHANGE_B(state: AState, b: string) {
      return { ...state, b };
    }
  },
  actions: {
    changeA: (a: string) => ({ getReducerActions } :App<CState>) => {
      const actions = getReducerActions() as MapModelDispatchBindedAction<string>;
      const A = actions.A as MapModelDispatchBindedAction<string>;
      const CHANGE_A = A.CHANGE_A as ModelDispatchBindedAction<string>;
      return CHANGE_A(a);
    },
    changeB: (b: string) => ({ getReducerActions } :App<CState>) => {
      const actions = getReducerActions() as MapModelDispatchBindedAction<string>;
      const A = actions.A as MapModelDispatchBindedAction<string>;
      const CHANGE_B = A.CHANGE_B as ModelDispatchBindedAction<string>;
      return CHANGE_B(b);
    },
  }
});

const B = new Model<BState>({
  defaultState: {
    c: 'c',
    d: ['d'],
  },
  handlers: {
    CHANGE_C(state: BState, c: string) {
      return { ...state, c };
    },
    CHANGE_D(state: BState, d: string[]) {
      return { ...state, d };
    }
  },
  actions: {
    changeC: (c: string) => ({ getReducerActions } :App<CState>) => {
      const actions = getReducerActions() as MapModelDispatchBindedAction<string>;
      const B = actions.B as MapModelDispatchBindedAction<string>;
      const CHANGE_C = B.CHANGE_C as ModelDispatchBindedAction<string>;
      return CHANGE_C(c);
    },
    changeD: (d: string) => ({ getReducerActions } :App<CState>) => {
      const actions = getReducerActions() as MapModelDispatchBindedAction<string>;
      const B = actions.B as MapModelDispatchBindedAction<string>;
      const CHANGE_D = B.CHANGE_D as ModelDispatchBindedAction<string>;
      return CHANGE_D(d);
    },
  }
});

const C = new Model<CState>({
  handlers: {
    A, B
  }
})

describe('测试redux的创建', () => {
  const app = new App();
  app.model(C);
  app.init();
  test('检查初始的state', () => {
    expect(app.store.getState()).toEqual({
      A: {
        a: 'a',
        b: 'b',
      },
      B: {
        c: 'c',
        d: ['d']
      }
    })
  })
  test('使用reducerAction来修改state', () => {
    const actions = app.getReducerActions() as MapModelDispatchBindedAction<string>;
    const A = actions.A as MapModelDispatchBindedAction<string>;
    const CHANGE_A = A.CHANGE_A as ModelDispatchBindedAction<string>;
    CHANGE_A('aa');
    expect(app.store.getState()).toEqual({
      A: {
        a: 'aa',
        b: 'b',
      },
      B: {
        c: 'c',
        d: ['d']
      }
    })
  });
  test('使用actions来修改state', () => {
    const actions = app.getActions() as MapModelDispatchBindedAction<string>;
    const A = actions.A as MapModelDispatchBindedAction<string>;
    const changeB = A.changeB as ModelDispatchBindedAction<string>;
    changeB('bb');
    expect(app.store.getState()).toEqual({
      A: {
        a: 'aa',
        b: 'bb',
      },
      B: {
        c: 'c',
        d: ['d']
      }
    })
  });
})

describe('createConnect 函数可以自定义inject一些属性', () => {
  const app = new App();
  app.model(C);
  app.init();
  const connect = createConnect({ props: { getActions: app.getActions, getReducerActions: app.getReducerActions } });
  test('在connect的组件中，会inject自定义的属性', () => {
    const Comp = connect()((props) => {
      expect(props.getActions).not.toBeNull();
      expect(props.getReducerActions).not.toBeNull();
      return <div />
    })
    const container = (
      <Provider store={app.store}>
        <Comp />
      </Provider>
    )
    const result = ReactDOMServer.renderToString(container);
    expect(result).toEqual('<div data-reactroot=\"\"></div>');
  })
});
