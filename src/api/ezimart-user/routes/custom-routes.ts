// src/api/discount/routes/discount.ts
export default {
    routes: [
      {
        method: 'POST',
        path: '/login', // Corrected route
        handler: 'ezimart-user.login',
        config: {
          auth: false, // No auth required
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/loginOAuth', // Corrected route
        handler: 'ezimart-user.loginOAuth',
        config: {
          auth: false, // No auth required
          policies: [],
        },
      },
    ],
  };
  