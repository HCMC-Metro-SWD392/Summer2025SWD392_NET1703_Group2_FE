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

export interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
};

export interface Line {
  id: string;
  metroName: string;
};

export interface Ticket {
  id: string;
  fromStation: string;
  toStation: string;
  price: number;
  createdAt: string;
  expirationDate: string;
  status: "unused" | "active" | "used";
}