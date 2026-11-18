export type Role = "owner" | "admin" | "manager" | "sales" | "finance" | "viewer";

export type AuthContext = {
  orgId: string;
  userId: string;
  deviceId?: string;
  roles: Role[];
};

export function can(_ctx: AuthContext, _permission: string): boolean {
  // TODO: permission matrix from spec §1.12/§14.2.
  return true;
}
