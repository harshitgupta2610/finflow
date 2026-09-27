import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { CompanyModule } from './modules/company/company.module';
import { FinancialYearModule } from './modules/financial-year/financial-year.module';
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { PartyModule } from './modules/party/party.module';
import { ItemModule } from './modules/item/item.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { SalesModule } from './modules/sales/sales.module';
import { PurchaseModule } from './modules/purchase/purchase.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    OrganizationModule,
    CompanyModule,
    FinancialYearModule,
    UserModule,
    AccountModule,
    PartyModule,
    ItemModule,
    AccountingModule,
    SalesModule,
    PurchaseModule,
    AiModule,
  ],
})
export class AppModule {}
