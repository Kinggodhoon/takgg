import { PlayerInfo } from '../application/players/model/players.model';

declare global {
  namespace Express {
    interface Request {
      requestParams: any,
      player: PlayerInfo,
    }

    interface Response {
      responseData: {
        code: number = 200,
        message: string = 'Success',
        data: any,
      },
      responseError: any,
    }
  }
}
