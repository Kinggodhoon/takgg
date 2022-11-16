import { Database } from '../database/database'
import Service from '../module/service/dto/service.dto'

declare global {
  namespace Express {
    interface Request {
      database: Database,
      user: any, // TODO: create user interface
    }

    interface Response {
      responseData: {
        code: number,
        message: string,
        data: any,
      },
      responseError: any,
    }
  }
}
