'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { cn } from '@/lib/utils'; // Optional, if you're using a utility to combine class names
import { Link } from 'react-router-dom';

type FormValues = { email: string; password: string };

export default function LoginPage() {
    const { login } = useAuth();
    const [authError, setAuthError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        // defaultValues: {
        //     email: 'helloTestUser@gmail.com',
        //     password: 'Zouazou2ddd001@',
        // },
    });

    const onSubmit = async (vals: FormValues) => {
        setAuthError('');
        try {
            await login(vals.email, vals.password);
            window.location.href = '/';
        } catch (err) {
            setAuthError('Email or password is incorrect.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

                    {authError && (
                        <div className="mb-4 text-red-600 text-sm text-center">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className={cn(errors.email && 'border-red-500')}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...register('password', { required: 'Password is required' })}
                                className={cn(errors.password && 'border-red-500')}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in…' : 'Login'}
                        </Button>
                    </form>

                    <p className="text-sm text-center mt-4">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Register here
                        </Link>
                    </p>
                    <br />
                    <p className="text-sm text-center mt-4">
                        to log as admin use email: zakariyazouazou@gmail.com and password: Qwerty123
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
