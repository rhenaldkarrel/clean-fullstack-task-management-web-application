export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthSuccessResponse = {
  data: {
    user: PublicUser;
    accessToken: string;
  };
};

export type CurrentUserResponse = {
  data: PublicUser;
};
