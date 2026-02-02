export class RefreshSessionDto {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  revokedAt: Date | null;
  isCurrent: boolean;
}
