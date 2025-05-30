export interface RegisterPayload {
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: true;
}

export interface UserInfo  {
  id: string;
  avatar?: string;
  fullName: string;
  email: string;
};