import express from 'express';

abstract class Controller {
  protected router = express.Router();
}

export default Controller;
