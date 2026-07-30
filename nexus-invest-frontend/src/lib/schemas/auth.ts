import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50),
    last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
    email: z.string().min(1, "L'email est requis").email('Email invalide'),
    phone: z.string().min(8, 'Le téléphone doit contenir au moins 8 chiffres'),
    country: z.string().min(1, 'Le pays est requis'),
    country_code: z.string().min(1, "L'indicatif est requis"),
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
    confirm_password: z.string().min(1, 'La confirmation est requise'),
    referral_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

export type RegisterForm = z.infer<typeof registerSchema>;

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'),
    confirm_password: z.string().min(1, 'La confirmation est requise'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

export type PasswordResetForm = z.infer<typeof passwordResetSchema>;
