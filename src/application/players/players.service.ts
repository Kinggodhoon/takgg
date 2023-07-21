import { Database, InputParameter } from '../../database/database';
import { PlayerInfo, PlayerProfile } from './model/players.model';

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
        player_id as "playerId"
        ,real_name as "realName"
        ,display_name as "displayName"
        ,profile_image as "profileImage"
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

  public getPlayerProfile = async (playerId: string): Promise<PlayerProfile | null> => {
    const query = `
      SELECT
        p.player_id as "playerId"
        ,p.real_name as "realName"
        ,p.display_name as "displayName"
        ,p.profile_image as "profileImage"
        ,pp.style as "style"
        ,rk.name as "racket"
        ,STRING_AGG(rb.name, ',') as "rubberList"
      FROM player p
      JOIN player_profile pp ON (pp.player_id = p.player_id)
      left JOIN rackets rk ON (rk.racket_id = pp.racket_id)
      left JOIN rubbers rb ON (rb.rubber_id = ANY(pp.rubber_id_list))
      WHERE p.player_id = @playerId
      group by p.player_id, pp.style, rk.name
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    };

    const result = await Database.prepareExcute<PlayerProfile>({
      query,
      inputParams,
    });

    if (!result) return null;

    // Formatting rubber list
    result[0].rubberList = result[0].rubberList ? (result[0].rubberList! as string).split(',') : null;
    return result[0];
  }

  public getAllPlayerList = async (): Promise<Array<PlayerInfo>> => {
    const query = `
      SELECT
        player_id as "playerId"
        ,real_name as "realName"
        ,display_name as "displayName"
        ,profile_image as "profileImage"
      FROM player
    `;

    const result = await Database.prepareExcute<PlayerInfo>({
      query,
    });

    if (!result) return []
    return result;
  }
}

export default PlayersService;
