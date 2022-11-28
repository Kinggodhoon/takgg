import express from 'express';

abstract class Controller {
  protected router = express.Router();

  public getRouter() {
    return this.router;
  }
}

export default Controller;
