/**
 * ezimart-user controller (TypeScript)
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
});
