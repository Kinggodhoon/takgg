export declare global {
  namespace Express {
    interface Request {
      requestParams: any,
      user: any,
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
