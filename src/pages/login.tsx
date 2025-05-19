'use client';

import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import axios from 'axios';

type FormValues = { email: string; password: string };

export default function LoginPage() {
    // const { login } = useAuth();
    // const navigate = useNavigate();
    const { register, handleSubmit, formState, setError } = useForm<FormValues>({
        defaultValues: {
            email: 'helloTestUser@gmail.com',
            password: 'Zouazou2ddd001@',
        },
    });

    // const onSubmit = async (vals: FormValues) => {
    //     try {
    //         await login(vals.email, vals.password);
    //         navigate('/');
    //     } catch (err) {
    //         alert('Login failed');
    //     }
    // };



    // 1. Define onSubmit
    const onSubmit = async (data: FormValues) => {
        try {
            // 2. Send POST to your Symfony login_check
            const response = await axios.post(
                'https://symfony-app.zakariyazouazou.com/api/login_check',
                { username: data.email, password: data.password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,           // crucial for cookies
                }
            );

            console.log(response.data);
            // login(data.email, data.password);

            // 3. Store JWT
            // localStorage.setItem('jwt', response.data.token);

            // 4. Redirect on success
            // navigate('/dashboard');
        } catch (err: any) {
            console.log("error detected herer ", err);
            // 5. Map server error to form error
            const msg =
                err.response?.data?.message ||
                'Login failed – please check your credentials.';
            setError('password', { type: 'server', message: msg });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md">
                <CardContent>
                    <h2 className="text-2xl mb-4">Login</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register('email', { required: true })} />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password', { required: true })} />
                        </div>
                        <Button type="submit" disabled={formState.isSubmitting}>
                            {formState.isSubmitting ? 'Logging in…' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
