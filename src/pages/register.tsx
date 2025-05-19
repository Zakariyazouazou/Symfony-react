'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';

type FormValues = { name: string; email: string; password: string };

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm<FormValues>();

  const onSubmit = async (vals: FormValues) => {
    try {
      await registerUser(vals.name, vals.email, vals.password);
      navigate('/');
    } catch (err) {
      alert('Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-2xl mb-4">Register</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email', { required: true })} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password', { required: true })} />
            </div>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? 'Signing up…' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
