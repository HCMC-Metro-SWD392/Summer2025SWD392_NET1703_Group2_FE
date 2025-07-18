export interface GetAdminManagerDTO {
  id: string; // Guid in C# maps to string in TS
  fullName: string | null;
  address: string | null;
  sex: string | null;
  dateOfBirth: string | null; // DateOnly in C# is best represented as string (ISO date) in TS
  userName: string | null;
  email: string | null;
  phoneNumber: string | null;
  identityId: string | null;
}
