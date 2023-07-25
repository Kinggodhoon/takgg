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

export interface PlayerRating {
  playerId: string;
  displayName: string;
  ratingPoint: number;
  ratingTransition?: number;
}

export interface PlayerProfile {
  playerId: string;
  realName: string;
  displayName: string;
  profileImage: string;
  style: PlayerStyle;
  racket: string | null;
  rubberList: string | Array<string> | null;
  ratingPoint: number;
}

export class GetPlayerProfileRequest {
  @IsString()
  @IsDefined()
  public playerId: string;

  constructor(
    playerId: string,
  ) {
    this.playerId = playerId;
  }
}
