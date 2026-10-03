import { Role } from 'src/generated/prisma/enums';

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};
