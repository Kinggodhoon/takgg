import express from 'express';
import { v4 as uuid } from 'uuid';

import Controller from '../controller';
import { Database, initDatabase, releaseDatabase } from '../../database/database';
import { SlackActionType, SlackEventParams } from './model/slack.model';
import { HttpException } from '../../types/exception';
import PlayersService from '../players/players.service';
import AuthService from '../auth/auth.service';
import response from '../../middleware/response';
import SlackService from './slack.service';

class SlackController extends Controller {
  public readonly path = '/slack';

  // Services
  private slackService: SlackService;
  private playersService: PlayersService;
  private authService: AuthService;

  constructor() {
    super();
    this.initializeRoutes();
    this.slackService = new SlackService();
    this.playersService = new PlayersService();
    this.authService = new AuthService();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}`, initDatabase, this.getAuthToken, releaseDatabase, response);
  }

  private getAuthToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Get request params
      const params: SlackEventParams = JSON.parse(req.body.payload);

      // Validating slack request type
      if (!Object.values(SlackActionType).includes(params.actions[0].action_id)) throw new HttpException(400, 'Invalid Slack Request');

      const { action_id: actionsId } = params.actions[0];

      // Generate auth token flows
      if (actionsId === SlackActionType.GET_AUTH_TOKEN) {
        // Get user profile
        const getUserProfileReponse = await this.slackService.getUserProfile(params.user.id);
        const { profile: slackUserProfile } = getUserProfileReponse;
        if (!getUserProfileReponse.ok || !slackUserProfile) throw new HttpException(418, 'Slack Request Error');

        // Insert user info
        const playerInfo = await this.playersService.getPlayerInfo(params.user.id);

        const oneTimeToken = uuid().replace(/-/g, '');
        await Database.startTransaction();
        try {
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
          await this.authService.insertOnetimeToken(params.user.id, oneTimeToken);

          await Database.commitTransaction();
        } catch {
          await Database.rollbackTransaction();
        }

        // Response slack DM
        await this.slackService.sendAuthTokenMessage({
          playerId: params.user.id,
          displayName: slackUserProfile.display_name!,
        }, oneTimeToken);
      }

      if (actionsId === SlackActionType.VALIDATED_GAME) {

      }

      if (actionsId === SlackActionType.INVALID_GAME) {

      }

    } catch (error) {
      console.log(error);
      // TODO: send something has wrong slack message
    }
    return next();
  }
}

export default SlackController;
