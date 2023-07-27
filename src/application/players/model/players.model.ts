import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

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

export class UpdatePlayerProfileRequest {
  @IsEnum(PlayerStyle)
  @IsOptional()
  public style?: PlayerStyle;

  @IsNumber()
  @IsOptional()
  public racket?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(2)
  public rubbers?: Array<number>;

  constructor(
    style?: PlayerStyle,
    racket?: number,
    rubbers?: Array<number>,
  ) {
    this.style = style;
    this.racket = racket;
    this.rubbers = rubbers;
  }
}
