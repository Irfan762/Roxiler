'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../services/auth.service';
import { changePasswordSchema, type changePasswordSchema as _t } from '../../schemas/auth.schema';
import type { z } from 'zod';

type FormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error: errorToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.changePassword(data.currentPassword, data.newPassword, data.confirmPassword);
      success('Password changed successfully');
      reset();
      setIsOpen(false);
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Change password"
        title="Change Password"
      >
        <KeyRound className="h-5 w-5" />
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Change Password" className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            hint="8-16 chars, 1 uppercase, 1 special char"
            {...register('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
