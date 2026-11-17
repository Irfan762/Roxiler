import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { db } from './setup';
import authService from '../src/services/auth.service';
import userService from '../src/services/user.service';
import { ApiError } from '../src/utils/errors';

describe('Authentication Service', () => {
  beforeEach(() => db.reset());

  describe('Signup', () => {
    it('should create a new NORMAL_USER with hashed password', async () => {
      const result = await authService.signup({
        name: 'Test User With a Long Enough Name',
        email: 'test@example.com',
        address: '123 Test Street',
        password: 'Password@123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(Role.NORMAL_USER);
      expect(result.token).toBeDefined();
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should hash the password with bcrypt (not store plain text)', async () => {
      const result = await authService.signup({
        name: 'Test User With a Long Enough Name',
        email: 'hash@example.com',
        address: '123 Test Street',
        password: 'Password@123',
      });

      // Look up raw user from db to verify hash
      const rawUser = db.users.find((u) => u.id === result.user.id);
      expect(rawUser).toBeDefined();
      expect(rawUser!.passwordHash).not.toBe('Password@123');
      const isMatch = await bcrypt.compare('Password@123', rawUser!.passwordHash);
      expect(isMatch).toBe(true);
    });

    it('should reject duplicate email on signup', async () => {
      await authService.signup({
        name: 'First User With a Long Enough Name',
        email: 'dup@example.com',
        address: '123 Test Street',
        password: 'Password@123',
      });

      await expect(
        authService.signup({
          name: 'Second User With a Long Enough Name',
          email: 'dup@example.com',
          address: '456 Other Street',
          password: 'Password@123',
        }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('Login', () => {
    it('should login with correct credentials and return a token', async () => {
      await authService.signup({
        name: 'Login User With a Long Enough Name',
        email: 'login@example.com',
        address: '123 Login Street',
        password: 'Password@123',
      });

      const result = await authService.login('login@example.com', 'Password@123');
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
    });

    it('should reject login with wrong password', async () => {
      await authService.signup({
        name: 'Wrong Pass User With a Long Name',
        email: 'wrongpass@example.com',
        address: '123 Street',
        password: 'Password@123',
      });

      await expect(
        authService.login('wrongpass@example.com', 'WrongPassword@1'),
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'Password@123'),
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Change Password', () => {
    it('should change password when current is correct', async () => {
      const result = await authService.signup({
        name: 'Change Pass User With a Long Name',
        email: 'changepw@example.com',
        address: '123 Street',
        password: 'Password@123',
      });

      await authService.changePassword(result.user.id, 'Password@123', 'NewPass@1234');

      // Should be able to login with new password
      const loginResult = await authService.login('changepw@example.com', 'NewPass@1234');
      expect(loginResult.token).toBeDefined();
    });

    it('should reject change when current password is wrong', async () => {
      const result = await authService.signup({
        name: 'Change Pass User With a Long Name',
        email: 'changepw2@example.com',
        address: '123 Street',
        password: 'Password@123',
      });

      await expect(
        authService.changePassword(result.user.id, 'WrongPassword', 'NewPass@1234'),
      ).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('Role-based authorization (Admin user creation)', () => {
    it('admin can create a user with any role', async () => {
      const adminUser = await userService.createUser({
        name: 'Admin Created Store Owner Person',
        email: 'admincreated@example.com',
        password: 'Password@123',
        address: '123 Admin Street',
        role: Role.STORE_OWNER,
      });

      expect(adminUser.role).toBe(Role.STORE_OWNER);
      expect(adminUser.email).toBe('admincreated@example.com');
    });

    it('should reject creating a user with duplicate email', async () => {
      await userService.createUser({
        name: 'First Admin Created User Person',
        email: 'admincreated2@example.com',
        password: 'Password@123',
        address: '123 Street',
        role: Role.NORMAL_USER,
      });

      await expect(
        userService.createUser({
          name: 'Second Admin Created User Person',
          email: 'admincreated2@example.com',
          password: 'Password@123',
          address: '456 Street',
          role: Role.NORMAL_USER,
        }),
      ).rejects.toThrow('already exists');
    });
  });
});
