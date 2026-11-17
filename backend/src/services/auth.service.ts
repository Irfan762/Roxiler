import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import userRepository from '../repositories/user.repository';
import { ApiError } from '../utils/errors';
import { JwtPayload } from '../types';

export class AuthService {
  /** Register a new NORMAL_USER. */
  async signup(data: { name: string; email: string; address?: string; password: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      address: data.address,
      role: Role.NORMAL_USER,
    });

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: this.toSafeUser(user),
      token,
    };
  }

  /** Login any role — returns user + token. */
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email, user.role);

    return {
      user: this.toSafeUser(user),
      token,
    };
  }

  /** Change password — verifies current password first. */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(userId, newHash);

    return { message: 'Password changed successfully' };
  }

  /** Generate a signed JWT. */
  private generateToken(id: string, email: string, role: Role): string {
    const payload: JwtPayload = { id, email, role };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }

  /** Strip sensitive fields from user object. */
  private toSafeUser(user: { id: string; name: string; email: string; address: string | null; role: Role; createdAt: Date; updatedAt: Date }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new AuthService();
