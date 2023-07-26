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
import GamesService from '../games/games.service';
import { GameStatus } from '../games/model/games.model';

class SlackController extends Controller {
  public readonly path = '/slack';

  // Services
  private slackService: SlackService;
  private playersService: PlayersService;
  private authService: AuthService;
  private gamesService: GamesService;

  constructor() {
    super();
    this.initializeRoutes();

    this.slackService = new SlackService();
    this.playersService = new PlayersService();
    this.authService = new AuthService();
    this.gamesService = new GamesService();
  }

  private initializeRoutes() {
    // slack app handler
    this.router.post(`${this.path}`, initDatabase, this.getAuthToken, response, releaseDatabase);
  }

  private getAuthToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Get request params
    const params: SlackEventParams = JSON.parse(req.body.payload);

    try {
      // Validating slack request type
      if (!Object.values(SlackActionType).includes(params.actions[0].action_id)) throw new HttpException(400, 'Invalid Slack Request');

      const { action_id: actionId } = params.actions[0];

      // Generate auth token flows
      if (actionId === SlackActionType.GET_AUTH_TOKEN) {
        // Get user profile
        const getUserProfileReponse = await this.slackService.getUserProfile(params.user.id);
        const { profile: slackUserProfile } = getUserProfileReponse;
        if (!getUserProfileReponse.ok || !slackUserProfile) throw new HttpException(418, 'Slack Request Error');

        // Insert user info
        const playerInfo = await this.playersService.getPlayerInfo(params.user.id);

        const oneTimeToken = uuid().replace(/-/g, '');
        try {
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
          await this.authService.insertOnetimeToken(params.user.id, oneTimeToken);

          await Database.commitTransaction();
        } catch {
          await Database.rollbackTransaction();
          throw new HttpException(409, 'Save User Data Error');
        }

        // Response slack DM
        await this.slackService.sendAuthTokenMessage({
          playerId: params.user.id,
          displayName: slackUserProfile.display_name!,
        }, oneTimeToken);
      }

      if (actionId === SlackActionType.VALIDATED_GAME) {
        const gameId = +params.actions[0].value;
        const gameInfo = await this.gamesService.getValidatingGameInfo(gameId)
        if (!gameInfo) throw new HttpException(404, 'Game Info Not Found');

        const ratingHistoryList = await this.gamesService.getRatingHistoryList(gameId);

        try {
          await Database.startTransaction();

          await this.gamesService.updateGameStatus(gameId, GameStatus.VALIDATED);
          await Promise.all(ratingHistoryList.map((ratingHistory) => this.playersService.updatePlayerRating(ratingHistory.playerId, ratingHistory.ratingTransition)));

          await Database.commitTransaction();
        } catch {
          await Database.rollbackTransaction();
          throw new HttpException(409, 'Update Data Error: Validated');
        }

        await this.slackService.sendSuccessCallbackMessage(params.user.id);
      }

      if (actionId === SlackActionType.INVALID_GAME) {
        const gameId = +params.actions[0].value;
        const gameInfo = await this.gamesService.getValidatingGameInfo(gameId)
        if (!gameInfo) throw new HttpException(404, 'Game Info Not Found');

        try {
          await Database.startTransaction();

          await this.gamesService.updateGameStatus(gameId, GameStatus.INVALID);

          await Database.commitTransaction();
        } catch {
          await Database.rollbackTransaction();
          throw new HttpException(409, 'Update Data Error: Invalid');
        }

        await this.slackService.sendSuccessCallbackMessage(params.user.id);
      }
    } catch (error) {
      console.log(error);
      await this.slackService.sendErrorMessage(params.user.id, (error as HttpException).message);
    }
    return next();
  }
}

export default SlackController;
