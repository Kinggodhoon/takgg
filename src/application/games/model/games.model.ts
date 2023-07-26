import 'reflect-metadata';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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

export interface MatchHistoryRaw {
  gameId: number;
  isWinner: boolean;
  status: GameStatus;
  ratingTransition: number;
  winnerPlayerId: string;
  winnerDisplayName: string;
  winnerProfileImage: string;
  loserPlayerId: string;
  loserDisplayName: string;
  loserProfileImage: string;
  gameResult: Array<GameResult>
}

export interface MatchHistory {
  gameId: number;
  isWinner: boolean;
  status: GameStatus;
  ratingTransition: number;
  winner: {
    playerId: string;
    displayName: string;
    profileImage: string;
    score: number;
  }
  loser: {
    playerId: string;
    displayName: string;
    profileImage: string;
    score: number;
  }
}

export class GetPlayerMatchHistoryRequest {
  @IsString()
  @IsDefined()
  public playerId: string;

  @Type(() => Number)
  @IsNumber()
  @IsDefined()
  public page: number;

  constructor(playerId: string, page: number) {
    this.playerId = playerId;
    this.page = page;
  }
}
