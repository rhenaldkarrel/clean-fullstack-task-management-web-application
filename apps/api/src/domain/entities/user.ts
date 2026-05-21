export type UserEntity = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};
