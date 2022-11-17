declare global {
  namespace Express {
    interface Request {
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
