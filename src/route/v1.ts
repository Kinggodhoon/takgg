import { Router } from 'express';
import AuthController from '../application/auth/auth.controller';
import GamesController from '../application/games/games.controller';
import PlayersController from '../application/players/players.controller';
import SlackController from '../application/slack/slack.controller';

const v1Router = Router();

const routes: Array<Router> = [
  new SlackController().getRouter(),
  new AuthController().getRouter(),
  new PlayersController().getRouter(),
  new GamesController().getRouter(),
];

for (const route of routes) {
  v1Router.use('/', route);
}

export = routes;
