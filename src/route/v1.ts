import { Router } from 'express';
import AuthController from '../application/auth/auth.controller';
import GamesController from '../application/games/games.controller';
import PlayersController from '../application/players/players.controller';
import SlackController from '../application/slack/slack.controller';
import RankController from '../application/rank/rank.controller';

const v1Router = Router();

const routes: Array<Router> = [
  new SlackController().getRouter(),
  new AuthController().getRouter(),
  new PlayersController().getRouter(),
  new GamesController().getRouter(),
  new RankController().getRouter(),
];

for (const route of routes) {
  v1Router.use('/', route);
}

export = routes;
