import { Request } from 'express';
import { Pool, QueryResult } from 'pg';
import { Profile, UserPreferences } from '../models/profile.model';
import bcrypt from 'bcrypt';
import { CustomRequest } from '../types/express';

export class ProfilesService {
    async getProfile(req: CustomRequest): Promise<Profile | null> {
        try {
            if (!req.user?.id) throw new Error('User not authenticated');

            const result: QueryResult = await req.db.query(
                'SELECT id, email, first_name, last_name, preferences FROM users WHERE id = $1',
                [req.user.id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error fetching profile: ${(error as Error).message}`);
        }
    }

    async updateProfile(req: CustomRequest): Promise<Profile | null> {
        try {
            if (!req.user?.id) throw new Error('User not authenticated');

            const { first_name, last_name, email } = req.body;
            const result: QueryResult = await req.db.query(
                `UPDATE users 
                SET first_name = $1, last_name = $2, email = $3, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $4 
                RETURNING id, email, first_name, last_name, preferences`,
                [first_name, last_name, email, req.user.id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Error updating profile: ${(error as Error).message}`);
        }
    }

    async updatePassword(req: CustomRequest): Promise<boolean> {
        try {
            if (!req.user?.id) throw new Error('User not authenticated');

            const { current_password, new_password } = req.body;

            // Verify current password
            const user = await req.db.query(
                'SELECT password FROM users WHERE id = $1',
                [req.user.id]
            );

            if (!user.rows[0]) {
                return false;
            }

            const isValid = await bcrypt.compare(current_password, user.rows[0].password);
            if (!isValid) {
                return false;
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(new_password, salt);

            // Update password
            await req.db.query(
                'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [hashedPassword, req.user.id]
            );

            return true;
        } catch (error) {
            throw new Error(`Error updating password: ${(error as Error).message}`);
        }
    }

    async updatePreferences(req: CustomRequest): Promise<UserPreferences | null> {
        try {
            if (!req.user?.id) throw new Error('User not authenticated');

            const { preferences } = req.body;
            const result: QueryResult = await req.db.query(
                `UPDATE users 
                SET preferences = $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING preferences`,
                [preferences, req.user.id]
            );
            return result.rows[0]?.preferences || null;
        } catch (error) {
            throw new Error(`Error updating preferences: ${(error as Error).message}`);
        }
    }
}
