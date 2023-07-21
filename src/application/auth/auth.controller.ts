import express from 'express';

import Controller from '../controller';
import { initDatabase, releaseDatabase } from '../../database/database';
import response from '../../middleware/response';
import parameterValidate from '../../middleware/parameter.validate';

import PlayersService from '../players/players.service';
import AuthService from './auth.service';
import { AuthRequest } from './model/auth.model';
import { HttpException } from '../../types/exception';
import { PlayerInfo } from '../players/model/players.model';

class AuthController extends Controller {
  public readonly path = '/auth';

  private playersService: PlayersService;
  private authService: AuthService;

  constructor() {
    super();
    this.initializeRoutes();

    this.playersService = new PlayersService();
    this.authService = new AuthService();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}`, parameterValidate(AuthRequest), initDatabase, this.auth, releaseDatabase, response);
  }

  private auth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const params = req.requestParams as AuthRequest;

      // Check authentication one time token
      const authTokenInfo = await this.authService.getOnetimeToken(params.oneTimeToken);
      if (!authTokenInfo) throw new HttpException(403, 'Invalid Authentication');

      // Get player profile
      const playerProfile = await this.playersService.getPlayerProfile(authTokenInfo.playerId);
      if (!playerProfile) throw new HttpException(403, 'Invalid Authentication');

      const accessToken = this.authService.generateAccessToken({
        playerId: playerProfile.playerId,
        realName: playerProfile.realName,
        displayName: playerProfile.displayName,
        profileImage: playerProfile.profileImage,
      } as PlayerInfo);

      await this.authService.deleteOnetimeToken(authTokenInfo);

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          accessToken,
          player: playerProfile,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }

    return next();
  }
}

export default AuthController;
