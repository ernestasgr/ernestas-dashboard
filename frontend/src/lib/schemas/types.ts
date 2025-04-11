import { z } from 'zod';
import { userSchema } from './user';

export type UserData = z.infer<typeof userSchema>;
