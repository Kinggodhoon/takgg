import bcrypt from 'bcrypt';

import { Database, InputParameter } from '../../database/database';
import { PlayerInfo, RegisterRequest } from './model/players.model';

class PlayersService {
  public readonly path = '/players';

  public registerPlayerInfo = async (params: RegisterRequest): Promise<boolean> => {
    // insert player info
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(params.password, salt);

    const query = `
      INSERT INTO player(username, email, password)
      VALUES(@username, @email, @password)
    `;

    const inputParams: InputParameter = {
      username: {
        value: params.username,
        type: 'VARCHAR',
      },
      email: {
        value: params.email,
        type: 'VARCHAR',
      },
      password: {
        value: hasedPassword,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  };

  public registerPlayerProfile = async (username: string): Promise<boolean> => {
    // insert player profile
    const query = `
      INSERT INTO player_profile(username)
      VALUES(@username)
    `;

    const inputParams: InputParameter = {
      username: {
        value: username,
        type: 'VARCHAR',
      },
    };

    await Database.prepareExcute<void>({
      query,
      inputParams,
    });

    return true;
  }

  public getPlayerByEmail = async (email: string): Promise<PlayerInfo | null> => {
    const query = `
      SELECT
        p.username
        ,p.email
        ,p.status
        ,pp.style
        ,pp.best_score as bestScore
      FROM player p
      LEFT JOIN player_profile pp ON (p.username = pp.username)
      WHERE p.email = @email
    `;

    const inputParams: InputParameter = {
      email: {
        value: email,
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
