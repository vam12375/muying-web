// API模块集中导出

import * as user from './user';
import * as product from './product';
import * as test from './test';
import * as cart from './cart';
import * as admin from './admin';
import * as message from './message';
import * as points from './points';

const api = {
  user,
  product,
  test,
  cart,
  admin,
  message,
  points
};

export default api; 