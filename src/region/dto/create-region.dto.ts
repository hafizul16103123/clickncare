import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class Name {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  en: string;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bn?: string;
}

class City extends Name {
  @ApiProperty()
  @IsNotEmpty()
  name: Name;

  @ApiProperty()
  @IsNotEmpty()
  zones: Name[];
}

export class CreateRegionDto {
  @ApiProperty()
  @IsNotEmpty()
  name: Name;

  @ApiProperty()
  @IsNotEmpty()
  cityList: City[];
}
