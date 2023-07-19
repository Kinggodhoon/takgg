import { IsDefined, IsString } from 'class-validator';

export enum PlayerStyle {
  SHAKE = 'shake',
  PENHOLD = 'penhold',
}

export interface PlayerInfo {
  playerId: string;
  realName: string;
  displayName: string;
  profileImage: string;
}

export interface PlayerProfile {
  playerId: string;
  realName: string;
  displayName: string;
  profileImage: string;
  style: PlayerStyle;
  raket?: string;
  rubberList?: Array<string>;
  bestRatingPoting: number;
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
