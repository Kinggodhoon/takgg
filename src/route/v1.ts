import { Router } from 'express';
import PlayersController from '../application/players/players.controller';
import SlackController from '../application/slack/slack.controller';

const v1Router = Router();

const routes: Array<Router> = [
  new SlackController().getRouter(),
  new PlayersController().getRouter(),
];

for (const route of routes) {
  v1Router.use('/', route);
}

export = routes;
