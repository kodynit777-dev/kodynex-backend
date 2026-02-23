import { IsNotEmpty, MinLength, IsString } from 'class-validator';

export class RegisterDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneE164: string;

  @IsString()
  @MinLength(6)
  password: string;
}