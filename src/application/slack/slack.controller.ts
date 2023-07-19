import express from 'express';
import { WebClient } from '@slack/web-api';
import { v4 as uuid } from 'uuid';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabse } from '../../database/database';
import { SlackActionType, SlackEventParams } from './model/slack.model';
import { HttpException } from '../../types/exception';
import PlayersService from '../players/players.service';
import AuthService from '../auth/auth.service';
import Config from '../../config/Config';

class SlackController extends Controller {
  public readonly path = '/slack';

  // SDK
  private slackClient: WebClient;

  // Services
  private playersService: PlayersService;
  private authService: AuthService;

  constructor() {
    super();
    this.initializeRoutes();
    this.slackClient = new WebClient(Config.getConfig().SLACK_BOT_CONFIG.BOT_TOKEN);
    this.playersService = new PlayersService();
    this.authService = new AuthService();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}/`, initDatabase, this.getAuthToken, releaseDatabse);
  }

  private getAuthToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Get request params
      const params: SlackEventParams = JSON.parse(req.body.payload);

      // Validating slack request type
      if (!Object.values(SlackActionType).includes(params.actions[0].value)) throw new HttpException(400, 'Invalid Slack Request');

      // Generate auth token flows
      // Get user profile
      const getUserProfileReponse = await this.slackClient.users.profile.get({ user: params.user.id })
      const { profile: slackUserProfile } = getUserProfileReponse;
      if (!getUserProfileReponse.ok || !slackUserProfile) throw new HttpException(418, 'Slack Request Error');

      // Insert user info
      const playerInfo = await this.playersService.getPlayerInfo(params.user.id);

      await Database.startTransaction();
      if (!playerInfo) {
        await this.playersService.insertPlayerInfo({
          playerId: params.user.id,
          realName: slackUserProfile.real_name!,
          displayName: slackUserProfile.display_name!,
          profileImage: slackUserProfile.image_512!,
        });
        await this.playersService.insertPlayerProfile(params.user.id);
      }

      // Generate auth one time token
      const oneTimeToken = uuid().replace(/-/g, '');
      // await this.authService.insertOnetimeToken(params.user.id, oneTimeToken);

      await Database.commitTransaction();

      // Response slack DM
      await this.slackClient.chat.postMessage({
        channel: params.user.id,
        text: `Hi ${params.user.id} here's your [TakGG] auth secret key! \n\nSecretKey: ${oneTimeToken} \n\nIf you don't have the [TakGG] application, DM Hoon!`,
      })
    } catch (error) {
      console.log(error);
      await Database.rollbackTransaction();
    }
    return next();
  }
}

export default SlackController;
