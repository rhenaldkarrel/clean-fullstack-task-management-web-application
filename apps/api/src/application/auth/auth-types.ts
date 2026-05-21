export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthResult = {
  user: PublicUser;
  accessToken: string;
};
