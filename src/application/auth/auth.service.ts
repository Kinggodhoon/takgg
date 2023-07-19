import { Database, InputParameter } from '../../database/database';

import { AuthTokenInfo } from './model/auth.model';

class AuthService {
  public insertOnetimeToken = async (playerId: string, oneTimeToken: string): Promise<boolean> => {
    const query = `
      INSERT INTO auth_token(player_id, one_time_token)
      VALUES(@playerId, @oneTimeToken)
    `;

    const inputParams: InputParameter = {
      playerId: {
        value: playerId,
        type: 'VARCHAR',
      },
      oneTimeToken: {
        value: oneTimeToken,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  };

  public getOnetimeToken = async (oneTimeToken: string): Promise<AuthTokenInfo | null> => {
    const query = `
      SELECT
        player_id as playerId
        ,one_time_token as oneTimeToken
      FROM auth_token
      WHERE one_time_token = @oneTimeToken
    `;

    const inputParams: InputParameter = {
      oneTimeToken: {
        value: oneTimeToken,
        type: 'VARCHAR',
      },
    };

    const result = await Database.prepareExcute<AuthTokenInfo>({
      query,
      inputParams,
    });

    return result ? result[0] : null;
  };
}

export default AuthService;
