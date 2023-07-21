import 'reflect-metadata';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';

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
  racket: string | null;
  rubberList: string | Array<string> | null;
  bestRatingPoting: number;
}

class GameResult {
  @IsString()
  @IsDefined()
  playerId!: string;

  @IsNumber()
  @IsDefined()
  score!: number;
}

export class SubmitGameResultRequest {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => GameResult)
  public resultList: Array<GameResult>;

  constructor(
    resultList: Array<GameResult>,
  ) {
    this.resultList = resultList;
  }
}
