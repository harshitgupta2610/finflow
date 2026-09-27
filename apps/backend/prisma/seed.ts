import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FinFlow database seed...');

  // 1. Seed Roles
  const roles = [
    { name: RoleName.OWNER, description: 'Full access to organization & companies', isSystem: true },
    { name: RoleName.ADMIN, description: 'Company administrative access', isSystem: true },
    { name: RoleName.ACCOUNTANT, description: 'Full access to accounting, reports, vouchers', isSystem: true },
    { name: RoleName.SALES, description: 'Sales invoices, customers, quotations', isSystem: true },
    { name: RoleName.PURCHASE, description: 'Purchase orders, invoices, suppliers', isSystem: true },
    { name: RoleName.INVENTORY_MANAGER, description: 'Stock, items, warehouse management', isSystem: true },
    { name: RoleName.AUDITOR, description: 'Read-only access to audit logs and reports', isSystem: true },
    { name: RoleName.VIEWER, description: 'Read-only access to dashboard and views', isSystem: true },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }
  console.log('✅ Roles seeded.');

  // 2. Seed Permissions
  const permissions = [
    { code: 'company.read', description: 'View company details', module: 'Company' },
    { code: 'company.update', description: 'Update company settings', module: 'Company' },
    { code: 'party.create', description: 'Create party master', module: 'Party' },
    { code: 'party.read', description: 'View party master', module: 'Party' },
    { code: 'party.update', description: 'Update party details', module: 'Party' },
    { code: 'party.delete', description: 'Delete party', module: 'Party' },
    { code: 'item.create', description: 'Create item master', module: 'Item' },
    { code: 'item.read', description: 'View item master', module: 'Item' },
    { code: 'item.update', description: 'Update item details', module: 'Item' },
    { code: 'sales.create', description: 'Create sales invoices', module: 'Sales' },
    { code: 'sales.read', description: 'View sales invoices', module: 'Sales' },
    { code: 'sales.update', description: 'Edit sales invoices', module: 'Sales' },
    { code: 'sales.cancel', description: 'Cancel sales invoices', module: 'Sales' },
    { code: 'purchase.create', description: 'Create purchase invoices', module: 'Purchase' },
    { code: 'purchase.read', description: 'View purchase invoices', module: 'Purchase' },
    { code: 'payment.create', description: 'Make payment entries', module: 'Payments' },
    { code: 'receipt.create', description: 'Make receipt entries', module: 'Receipts' },
    { code: 'reports.read', description: 'View financial & GST reports', module: 'Reports' },
    { code: 'gst.read', description: 'View GST filings', module: 'GST' },
    { code: 'users.manage', description: 'Manage organisation users', module: 'Users' },
    { code: 'settings.manage', description: 'Manage system settings', module: 'Settings' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
  }
  console.log('✅ Permissions seeded.');

  // Assign all permissions to OWNER and ADMIN
  const ownerRole = await prisma.role.findUnique({ where: { name: RoleName.OWNER } });
  const allPerms = await prisma.permission.findMany();

  if (ownerRole) {
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: ownerRole.id,
          permissionId: perm.id,
        },
      });
    }
  }

  // 3. Seed Demo Organization & Company
  const demoOrg = await prisma.organization.upsert({
    where: { code: 'DEMO_ORG' },
    update: {},
    create: {
      name: 'FinFlow Enterprises Ltd',
      code: 'DEMO_ORG',
    },
  });

  const demoCompany = await prisma.company.upsert({
    where: { id: 'c0000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'c0000000-0000-0000-0000-000000000001',
      organizationId: demoOrg.id,
      legalName: 'FinFlow Demo Private Limited',
      displayName: 'FinFlow Demo',
      pan: 'ABCDE1234F',
      gstin: '27ABCDE1234F1Z5',
      address: 'Suite 404, Tech Park, BKC, Mumbai',
      state: 'Maharashtra',
      pincode: '400051',
      email: 'contact@finflowdemo.com',
      phone: '+91 98765 43210',
      currency: 'INR',
    },
  });

  // Seed Financial Year
  const fy = await prisma.financialYear.upsert({
    where: {
      companyId_name: {
        companyId: demoCompany.id,
        name: 'FY 2024-25',
      },
    },
    update: { isCurrent: true },
    create: {
      companyId: demoCompany.id,
      name: 'FY 2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isCurrent: true,
      isLocked: false,
    },
  });

  await prisma.company.update({
    where: { id: demoCompany.id },
    data: { activeFinancialYearId: fy.id },
  });

  // 4. Seed Super Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@finflow.com' },
    update: {},
    create: {
      organizationId: demoOrg.id,
      email: 'admin@finflow.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      phone: '+91 99999 88888',
      isActive: true,
      isVerified: true,
    },
  });

  if (ownerRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId_companyId: {
          userId: adminUser.id,
          roleId: ownerRole.id,
          companyId: demoCompany.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: ownerRole.id,
        companyId: demoCompany.id,
      },
    });
  }

  console.log('✅ Demo Organization, Company, FY & Admin User seeded successfully!');
  console.log(' Credentials: admin@finflow.com / Admin@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
