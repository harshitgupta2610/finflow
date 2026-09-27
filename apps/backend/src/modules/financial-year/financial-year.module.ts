import { Module } from '@nestjs/common';
import { FinancialYearService } from './financial-year.service';
import { FinancialYearController } from './financial-year.controller';

@Module({
  providers: [FinancialYearService],
  controllers: [FinancialYearController],
  exports: [FinancialYearService],
})
export class FinancialYearModule {}
