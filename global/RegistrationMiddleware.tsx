"use client";
// RegistrationMiddleware: Middleware for registration and profile checks
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/cookieMiddleware';

interface RegistrationMiddlewareProps {
    children: React.ReactNode;
    requireEmailVerified?: boolean;
    requireProfileComplete?: boolean;
    allowUnauthorized?: boolean;
}

const RegistrationMiddleware: React.FC<RegistrationMiddlewareProps> = ({
    children,
    requireEmailVerified = true,
    requireProfileComplete = true,
    allowUnauthorized = false,
}) => {
    const { user }: any = useUser();
    const userData = user?.user;
    const userType = user?.type;
    const router = useRouter();

    // If user is not logged in and the route requires authorization
    if (!userData && !allowUnauthorized) {
        router.push('/login/client');
        return null;
    }

    // If user is logged in but email is not verified
    if (userData && !userData.isEmailVerified && requireEmailVerified) {
        router.push('/activation');
        return null;
    }

    // Check if profile is complete for providers
    const isProfileComplete = (userData: any): boolean => {
        if (userType === 'provider') {
            return (
                userData.phoneNumber &&
                userData.description &&
                userData.hourlyRate &&
                userData.currency &&
                userData.languages?.length > 0 &&
                userData.offeredServices?.length > 0 &&
                userData.serviceArea?.length > 0
            );
        }
        return true;
    };

    // If profile is not complete and the route requires it
    if (userData && userType === 'provider' && requireProfileComplete) {
        if (userData.isEmailVerified && !isProfileComplete(userData)) {
            router.push('/register/provider?step=2');
            return null;
        }
    }

    return <>{children}</>;
};

export default RegistrationMiddleware;