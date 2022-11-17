import express from 'express';
import { validate } from 'class-validator';

import Controller from '../controller';
import { initDatabase, releaseDatabse } from '../../database/database';
import response from '../../middleware/response';

class PlayersController extends Controller {
  public readonly path = '/players';

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // auth
    this.router.post(`${this.path}/auth`, initDatabase, this.auth, releaseDatabse, response);
  }

  private auth = async (req: express.Request, res: express.Response) => {
    try {
      // request body validation
      const validated = await validate(authIn);
      if (validated.length > 0) {
        throw new Error('Invalid Parameter Error');
      }

      // auth signature check
      authIn.verifySignature();

      await db.startTransaction();

      const walletRepository: WalletRepository = new WalletMSSQLRepository(db);

      const authService = new AuthService(walletRepository);

      const authOut: AuthOUT = await authService.authenticate(authIn);

      await db.commitTransaction();

      const response = new Response(res, 200, authOut);
      await response.response();
    } catch (error: any) {
      await db.rollbackTransaction();
      Logger.error(error, { params: authIn, method: req.method, path: req.route.path });

      const response = new Response(res, error.status || 403, false, error.message);
      await response.response();
    }
  }

}

export default PlayersController;
