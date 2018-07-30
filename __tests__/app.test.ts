import { App, Model } from '../src';

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
    changeA: (a: string) => ({ getReducerActions } :App<CState>) => getReducerActions().CHANGE_A(a),
    changeB: (b: string) => ({ getReducerActions } :App<CState>) => getReducerActions().changeB(b),
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
    changeC: (c: string) => ({ getReducerActions } :App<CState>) => getReducerActions().CHANGE_C(c),
    changeD: (d: string[]) => ({ getReducerActions } :App<CState>) => getReducerActions().CHANGE_D(d),
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
  it('检查初始的state', () => {
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
})
