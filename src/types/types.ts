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

export interface LoginByGooglePayload {
  email: string;
  fullName: string;
  rememberMe: true;
}

export interface UserInfo  {
  id: string; 
  avatar?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  identityId: string;
  sex: string;
  customerType: number;
};


type MetroLine = {
  id: string;
  startStation: { id: string; name: string };
  endStation: { id: string; name: string };
  metroName: string;
};


export interface Station {
  id: string;
  name: string;
  address: string;
  description: string;
  metroLines?: MetroLine[];
};

export interface Line {
  id: string;
  metroName: string;
};

export interface LineStartAndEndStation {
  startStationName: string | undefined;
  endStationName: string | undefined;
};

// export interface Ticket {
//   id: string;
//   fromStation: string;
//   toStation: string;
//   price: number;
//   createdAt: string;
//   expirationDate: string;
//   status: "unused" | "active" | "used";
// }

export interface TicketType {
  id: string;
  name: string;
  displayName: string;
  expiration: number;
}

export interface Ticket {
  id: string;
  customerId: string;
  subscriptionTicketId: string | null;
  ticketRouteId: string;
  transactionId: string;
  ticketSerial: string;
  startDate: string;
  endDate: string;
  qrCode: string;
  fromStationRoute: string;
  toStationRoute: string;
  fromStationSub: string;
  toStationSub: string;
  price: number;
}
