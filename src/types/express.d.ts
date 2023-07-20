import { PlayerInfo } from '../application/players/model/players.model';
import { HttpException } from './exception';

export interface ResponseData {
  code?: number,
  message?: string,
  data?: any,
}

declare global {
  namespace Express {
    interface Request {
      requestParams: any,
      player: PlayerInfo,
    }

    interface Response {
      responseData: ResponseData,
      responseError: HttpException | any | unknown,
    }
  }
}
