import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  phoneE164: string;

  @IsString()
  @MinLength(6)
  password: string;
}
