import { IsDefined, IsString } from 'class-validator';

export interface AuthTokenInfo {
  playerId: string,
  oneTimeToken: string,
}

export class AuthRequest {
  @IsString()
  @IsDefined()
  public oneTimeToken: string;

  constructor(
    oneTimeToken: string,
  ) {
    this.oneTimeToken = oneTimeToken;
  }
}
