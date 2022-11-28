import { IsDefined, IsEmail, IsString } from 'class-validator';

export interface PlayerInfo {
  username: string;
  email: string;
  status: string;
  style: string;
  bestScore: number;
}

export class authRequest {

}

export class RegisterRequest {
  @IsString()
  @IsDefined()
  public username: string;

  @IsEmail()
  @IsDefined()
  public email: string;

  @IsString()
  @IsDefined()
  public password: string;

  constructor(
    username: string,
    email: string,
    password: string,
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
  }
}
