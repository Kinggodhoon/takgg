import EloRank from 'elo-rank';

import { Database, InputParameter } from '../../database/database';

import { PlayerRating } from '../players/model/players.model';
import { GameInfo, GameResult, GameStatus, RatingHistory } from './model/games.model';

class GamesService {
  public calculateRating = (ratings: {
    winner: PlayerRating,
    loser: PlayerRating,
  }): {
    winner: PlayerRating,
    loser: PlayerRating,
  } => {
    const elo = new EloRank();

    const winnerExpected = elo.getExpected(ratings.winner.ratingPoint, ratings.loser.ratingPoint);
    const loserExpected = elo.getExpected(ratings.loser.ratingPoint, ratings.winner.ratingPoint);

    const winnerRating = elo.updateRating(winnerExpected, 1, ratings.winner.ratingPoint);
    const loserRating = elo.updateRating(loserExpected, 0, ratings.loser.ratingPoint);

    return {
      winner: {
        playerId: ratings.winner.playerId,
        displayName: ratings.winner.displayName,
        ratingPoint: winnerRating,
        ratingTransition: winnerRating - ratings.winner.ratingPoint,
      },
      loser: {
        playerId: ratings.loser.playerId,
        displayName: ratings.loser.displayName,
        ratingPoint: loserRating,
        ratingTransition: loserRating - ratings.loser.ratingPoint,
      },
    }
  }

  public getValidatingGameInfo = async (gameId: number): Promise<GameInfo | null> => {
    const query = `
      SELECT
        game_id as "gameId"
        ,winner_player_id as "winnerPlayerId"
        ,loser_player_id as "loserPlayerId"
      FROM games
      WHERE game_id = @gameId
        AND status = @gameStatus
    `;

    const inputParams: InputParameter = {
      gameId: {
        value: gameId,
        type: 'INT4',
      },
      gameStatus: {
        value: GameStatus.VALIDATING,
        type: 'type_game_status',
      },
    }

    const gameInfo = await Database.prepareExcute<GameInfo>({
      query,
      inputParams,
    });

    return !gameInfo || gameInfo.length < 1 ? null : gameInfo[0];
  }

  public getRatingHistoryList = async (gameId: number): Promise<Array<RatingHistory>> => {
    const query = `
      SELECT
        game_id as "gameId"
        ,player_id as "playerId"
        ,rating_transition as "ratingTransition"
      FROM rating_history
      WHERE game_id = @gameId
    `;

    const inputParams: InputParameter = {
      gameId: {
        value: gameId,
        type: 'INT4',
      },
    }

    const ratingHistoryList = await Database.prepareExcute<RatingHistory>({
      query,
      inputParams,
    });

    return ratingHistoryList || [];
  }

  public updateGameStatus = async (gameId: number, gameStatus: GameStatus): Promise<boolean> => {
    const query = `
      UPDATE games
      SET status = @gameStatus
      WHERE game_id = @gameId
    `;

    const inputParams: InputParameter = {
      gameStatus: {
        value: gameStatus,
        type: 'type_game_status',
      },
      gameId: {
        value: gameId,
        type: 'INT4',
      },
    }

    await Database.prepareExcute<GameInfo>({
      query,
      inputParams,
    });

    return true;
  }

  public insertGameResult = async (
    winnerPlayerId: string,
    loserPlayerId: string,
    gameResult: Array<GameResult>,
  ): Promise<number> => {
    const query = `
      INSERT INTO games (winner_player_id, loser_player_id, result)
      VALUES (@winnerPlayerId, @loserPlayerId, @gameResult)
      RETURNING game_id as "gameId";
    `;

    const inputParams: InputParameter = {
      winnerPlayerId: {
        value: winnerPlayerId,
        type: 'VARCHAR',
      },
      loserPlayerId: {
        value: loserPlayerId,
        type: 'VARCHAR',
      },
      gameResult: {
        value: JSON.stringify(gameResult),
        type: 'JSONB',
      },
    };

    const result = await Database.prepareExcute<{
      gameId: number,
    }>({
      query,
      inputParams,
    });

    return result![0].gameId;
  }

  public insertRatingHistories = async (
    gameId: number,
    winner: PlayerRating,
    loser: PlayerRating,
  ): Promise<boolean> => {
    const query = `
      INSERT INTO rating_history (game_id, player_id, rating_transition)
      VALUES (@gameId, @winnerPlayerId, @winnerRatingTransition)
            ,(@gameId, @loserPlayerId, @loserRatingTransition)
    `;

    const inputParams: InputParameter = {
      gameId: {
        value: gameId,
        type: 'INT4',
      },
      winnerPlayerId: {
        value: winner.playerId,
        type: 'VARCHAR',
      },
      winnerRatingTransition: {
        value: winner.ratingTransition!,
        type: 'INT4',
      },
      loserPlayerId: {
        value: loser.playerId,
        type: 'VARCHAR',
      },
      loserRatingTransition: {
        value: loser.ratingTransition!,
        type: 'INT4',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  }
}

export default GamesService;
