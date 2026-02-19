import { type Role } from './Role';

export interface PersonDto {
  personId: number;
  fullName: string;
  role: Role;
  username: string;
}

export interface CreatePersonDto {
  fullName: string;
  role?: Role;
  username: string;
  password?: string;
}

export interface LoginPersonDto {
  username: string;
  password?: string;
}

export interface PatchPersonProfileDto {
  fullName?: string;
  username?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}