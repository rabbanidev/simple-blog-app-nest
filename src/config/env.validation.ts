import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  ValidationError,
} from 'class-validator';
import { Environment } from 'src/enum';

class EnvironmentVariables {
  @IsString()
  APP_NAME: string;

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  PORT: number;

  @IsString()
  MONGO_URI: string;

  @IsString()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: string;

  @IsString()
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  }) as EnvironmentVariables;

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  }) as ValidationError[];

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
