import 'reflect-metadata';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator';
import { IsValidGameResult } from '../../../decorator/gameResult.decorator';

export enum GameStatus {
  VALIDATING = 'validating',
  VALIDATED = 'validated',
  INVALID = 'invalid',
}

export interface GameInfo {
  gameId: number;
  winnerPlayerId: string;
  loserPlayerId: string;
}

export interface RatingHistory {
  gameId: number;
  playerId: string;
  ratingTransition: number;
}

export class GameResult {
  @IsString()
  @IsDefined()
  public playerId!: string;

  @IsNumber()
  @IsDefined()
  public score!: number;
}

export class SubmitGameResultRequest {
  @IsDefined()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => GameResult)
  @IsValidGameResult()
  public resultList: Array<GameResult>;

  constructor(
    resultList: Array<GameResult>,
  ) {
    this.resultList = resultList;
  }
}
