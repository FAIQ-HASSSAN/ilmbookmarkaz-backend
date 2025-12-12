import { Context, Next } from 'koa';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: Context, next: Next) => {
    // Only run for /api routes
    if (!ctx.request.url.startsWith('/api')) {
      return next();
    }
    const authHeader = ctx.request.headers.authorization;
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      console.log("index middleware:", token);
      // Replace the header value with only the raw token
      ctx.request.headers.authorization = token;
    }
    await next();
  };
};
