import { Database, InputParameter } from '../../database/database';
import { PlayerInfo, PlayerProfile, PlayerRating, UpdatePlayerProfileRequest } from './model/players.model';

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
    const query = `
      INSERT INTO player_profile(player_id)
      VALUES(@playerId)
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
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

  public getPlayerRatingList = async (playerIdList: Array<string>): Promise<Array<PlayerRating>> => {
    const query = `
      SELECT
        pp.player_id as "playerId"
        ,p.display_name as "displayName"
        ,pp.rating_point as "ratingPoint"
      FROM player_profile pp
      JOIN player p ON (p.player_id = pp.player_id)
      WHERE pp.player_id IN ('${playerIdList.join("','")}')
    `;

    const result = await Database.prepareExcute<PlayerRating>({
      query,
    });

    return result || [];
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
        ,pp.rating_point as "ratingPoint"
      FROM player p
      JOIN player_profile pp ON (pp.player_id = p.player_id)
      left JOIN rackets rk ON (rk.racket_id = pp.racket_id)
      left JOIN rubbers rb ON (rb.rubber_id = ANY(pp.rubber_id_list))
      WHERE p.player_id = @playerId
      group by p.player_id, pp.style, rk.name, pp.rating_point
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

  public updatePlayerProfile = async (playerId: string, updateParams: UpdatePlayerProfileRequest): Promise<boolean> => {
    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    }

    const updateQueryList: Array<string> = [];
    if (updateParams.style) {
      updateQueryList.push('style = @style');
      Object.assign(inputParams.style = {
        value: updateParams.style,
        type: 'type_user_style',
      });
    }
    if (updateParams.racket) {
      updateQueryList.push('racket_id = @racketId');
      Object.assign(inputParams.racketId = {
        value: updateParams.racket,
        type: 'INT4',
      });
    }
    if (updateParams.rubbers) updateQueryList.push(`rubber_id_list = '{${updateParams.rubbers.join(',')}}'`);

    const query = `
      UPDATE player_profile
      SET ${updateQueryList.join(', ')}
      WHERE player_id = @playerId
    `;

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  }

  public updatePlayerRating = async (playerId: string, ratingTransition: number): Promise<boolean> => {
    const query = `
      UPDATE player_profile
      SET rating_point = (rating_point + @ratingTransition)
      WHERE player_id = @playerId
    `;

    const inputParams: InputParameter = {
      ratingTransition: {
        value: ratingTransition,
        type: 'INT4',
      },
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  }
}

export default PlayersService;
