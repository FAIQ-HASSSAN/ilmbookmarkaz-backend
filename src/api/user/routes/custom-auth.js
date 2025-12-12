'use strict';

/**
 * Custom auth routes
 * This creates the endpoint: /api/user/auth/local/register-custom
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/auth/local/register-custom',
      handler: 'custom-auth.register',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

