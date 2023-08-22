import express from 'express';

import Controller from '../controller';
import { initDatabase } from '../../database/database';
import response from '../../middleware/response';
import ItemsService from './items.service';
import authorizeValidate from '../../middleware/authorize.validate';

class ItemsController extends Controller {
  public readonly path = '/items';

  private itemsService: ItemsService;

  constructor() {
    super();
    this.initializeRoutes();

    this.itemsService = new ItemsService();
  }

  private initializeRoutes() {
    // Get all players
    this.router.get(`${this.path}`, authorizeValidate, initDatabase, this.getAllItems, response);
  }

  private getAllItems = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const racketList = await this.itemsService.getAllRackets();
      const rubberList = await this.itemsService.getAllRubbers();

      res.responseData = {
        code: 200,
        message: 'Success',
        data: {
          rackets: racketList,
          rubbers: rubberList,
        },
      }
    } catch (error) {
      console.log(error);
      res.responseError = error;
    }
    return next();
  }
}

export default ItemsController;
