import { Database, InputParameter } from '../../database/database';
import { PlayerInfo } from './model/players.model';

class PlayersService {
  public insertPlayerInfo = async (params: PlayerInfo): Promise<boolean> => {
    // Insert player
    const query = `
      INSERT INTO player(player_id, real_name, display_name, profile_image)
      VALUES(@playerId, @realName, @displayName, @profileImage)
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: params.playerId,
        type: 'VARCHAR',
      },
      realName: {
        value: params.realName,
        type: 'VARCHAR',
      },
      displayName: {
        value: params.displayName,
        type: 'VARCHAR',
      },
      profileImage: {
        value: params.profileImage,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  };

  public insertPlayerProfile = async (playerId: string): Promise<boolean> => {
    // Insert player profile
    const insertPlayerProfileQuery = `
      INSERT INTO player_profile(player_id)
      VALUES(@playerId)
    `;

    const insertPlayerRatingQuery = `
      INSERT INTO ratings(player_id)
      VALUES(@playerId)
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query: insertPlayerProfileQuery,
      inputParams,
    });

    await Database.prepareExcute<void>({
      query: insertPlayerRatingQuery,
      inputParams,
    });

    return true;
  };

  public getPlayerInfo = async (playerId: string): Promise<PlayerInfo | null> => {
    const query = `
      SELECT
        player_id as playerId
        ,real_name as realName
        ,display_name as displayName
        ,profile_image as profileImage
      FROM player
      WHERE player_id = @playerId
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    };

    const result = await Database.prepareExcute<PlayerInfo>({
      query,
      inputParams,
    });

    return result ? result[0] : null;
  }
}

export default PlayersService;
