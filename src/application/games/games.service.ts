import EloRank from 'elo-rank';

import { Database, InputParameter } from '../../database/database';

import { PlayerRating } from '../players/model/players.model';
import { GameResult } from './model/games.model';

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
