import { Context, Next } from 'koa';
import jwt from 'jsonwebtoken';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: Context, next: Next) => {
    const authHeader = ctx.request.headers['authorization'] as string | undefined;
    console.log("check auth middleware:", authHeader);
    if (!authHeader) {
      return ctx.throw(403, 'Forbidden: Missing or invalid Authorization header');
    }
    // Check if token exists in DB
    const tokenRecord = await strapi.db.query('api::token.token').findOne({
      where: { token: authHeader },
    });
    if (!tokenRecord) {
      return ctx.send({ status: "inValidToken", msg: "token is invalid" });
    }
    try {
      // Verify JWT
      const payload = jwt.verify(authHeader, process.env.JWT_CONFIRMATION_SECRET as string);
      console.log("JWT verified payload:", payload);
    } catch (err: any) {
      console.error("JWT verification failed:", err);
      // Delete expired/invalid token(s) from DB
      const existing = await strapi.entityService.findMany('api::token.token', {
        filters: { token: authHeader },
      });
      if (existing && existing.length > 0) {
        for (const record of existing) {
          await strapi.entityService.delete('api::token.token', record.id);
        }
      }
      if (err.name === 'TokenExpiredError') {
        return ctx.throw(403, 'Session has been expired');
      }
      return ctx.throw(403, 'Session has been expired');
    }
    await next();
  };
};
