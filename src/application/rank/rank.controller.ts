import express from 'express';

import Controller from '../controller';
import { initDatabase, releaseDatabase } from '../../database/database';
import response from '../../middleware/response';
import authorizeValidate from '../../middleware/authorize.validate';

import RankService from './rank.service';

class RankController extends Controller {
  public readonly path = '/ranking';

  private rankService: RankService;

  constructor() {
    super();
    this.initializeRoutes();

    this.rankService = new RankService();
  }

  private initializeRoutes() {
    // Get ranking
    this.router.get(`${this.path}`, authorizeValidate, initDatabase, this.getRanking, response, releaseDatabase);
  }

  private getRanking = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const rankList = await this.rankService.getRanking();

      res.responseData = {
        code: 200,
        message: 'Success',
        data: rankList,
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default RankController;
