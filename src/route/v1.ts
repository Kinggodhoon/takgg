import { Router } from 'express';
import PlayersController from '../application/players/players.controller';

const v1Router = Router();

const routes: Array<Router> = [
  new PlayersController().getRouter(),
];

for (const route of routes) {
  v1Router.use('/', route);
}

export = routes;
