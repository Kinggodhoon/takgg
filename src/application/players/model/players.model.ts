import { IsDefined, IsEmail, IsString } from 'class-validator';

export class authRequest {

}

export class registerRequest {
  @IsString()
  @IsDefined()
  public username: string;

  @IsEmail()
  @IsDefined()
  public email: string;

  @IsString()
  @IsDefined()
  public password: string;

  constructor(params: {
    username: string;
    email: string;
    password: string;
  }) {
    this.username = params.username;
    this.email = params.email;
    this.password = params.password;
  }
}
