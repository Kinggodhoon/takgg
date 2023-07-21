import { Router } from 'express';
import AuthController from '../application/auth/auth.controller';
import PlayersController from '../application/players/players.controller';
import SlackController from '../application/slack/slack.controller';

const v1Router = Router();

const routes: Array<Router> = [
  new AuthController().getRouter(),
  new SlackController().getRouter(),
  new PlayersController().getRouter(),
];

for (const route of routes) {
  v1Router.use('/', route);
}

export = routes;
