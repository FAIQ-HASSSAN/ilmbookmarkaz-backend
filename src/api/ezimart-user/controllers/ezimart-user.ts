/**
 * ezimart-user controller (TypeScript)
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleSecretId = process.env.GOOGLE_SECRET;


export default factories.createCoreController('api::ezimart-user.ezimart-user', {
    async login(ctx: Context) {
        const { email, password } = ctx.request.body as { email: string; password: string };
        if (!email || !password) {
            ctx.badRequest('Incorrect email or password. Please try again');
            return;
        }
        try {
            const user = await strapi.db.query('api::ezimart-user.ezimart-user').findOne({
                where: { email: email.toLowerCase() },
            });
            if (!user) {
                ctx.badRequest('Please sign up to continue');
                return;
            }
            const currentPassword = user.password;
            console.log(`current pass ${currentPassword}`)
            // Compare the plain password from request with the hashed password in DB
            const validPassword = await bcrypt.compare(password, currentPassword);
            if (!validPassword) {
                ctx.badRequest('Incorrect email or password. Please try again');
                return;
            }
            // return user ?? 'not found';
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret', {
                expiresIn: '48h',
            });
            await strapi.entityService.create('api::token.token', {
                data: {
                    token: token,
                },
            });
            ctx.send({
                message: 'Sign-in successfully',
                user,
                token,
            });
        } catch (error) {
            console.error(error);
            ctx.internalServerError('Error during sign-in');
        }
    },
    async loginOAuth(ctx) {
        try {
            const googleClientId = process.env.GOOGLE_CLIENT_ID;
            const idToken = ctx.request.query.id_token as string | undefined;

            if (!idToken) {
                return ctx.badRequest("Missing id_token");
            }
            const client = new OAuth2Client(googleClientId);
            const ticket = await client.verifyIdToken({
                idToken,
                audience: googleClientId,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return ctx.badRequest("Invalid Google token");
            }
            const googleId = payload.sub;
            const email = payload.email;
            const emailVerified = payload.email_verified;
            if (!emailVerified) {
                return ctx.badRequest("Email not verified by Google");
            }
            let user = await strapi.db.query("api::ezimart-user.ezimart-user").findOne({
                where: { googleLoginId:googleId },
            });
            if (!user) {
                user =  await strapi.entityService.create('api::ezimart-user.ezimart-user', {
                    data: {
                        googleLoginId: googleId,
                        email,
                        username: email.split("@")[0],
                        provider: "google",
                    },
                });
            }
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret', {
                expiresIn: '48h',
            });
            return {
                jwt: token,
                user,
            };
        } catch (err) {
            console.error("Google Login Error:", err);
            return ctx.internalServerError("Google login failed");
        }
    }
});
