import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/api-client';
import { AUTH_URLS } from '../constants/urls/auth';
import { UserData } from '../schemas/types';
import { userSchema } from '../schemas/user';

export const useUser = () => {
    return useQuery<UserData>({
        queryKey: ['userData'],
        queryFn: async () => {
            const { data }: { data: unknown } = await apiClient.get(
                AUTH_URLS.USER_INFO,
            );
            return userSchema.parse(data);
        },
    });
};
