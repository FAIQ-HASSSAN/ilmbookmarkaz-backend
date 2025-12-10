// src/api/discount/routes/discount.ts
export default {
  routes: [
    {
      method: 'GET',
      path: '/open-ai', // Corrected route
      handler: 'discount.openai',
      config: {
        auth: false, // No auth required
        policies: [],
      },
    },
  ],
};
