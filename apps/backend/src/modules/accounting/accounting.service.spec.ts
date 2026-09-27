import { BadRequestException } from '@nestjs/common';
import { AccountingService } from './accounting.service';

describe('AccountingService - Double Entry Validation', () => {
  let service: AccountingService;

  beforeEach(() => {
    // Mock Prisma & Audit Services
    const mockPrisma: any = {};
    const mockAudit: any = {};
    const mockAccount: any = {};
    service = new AccountingService(mockPrisma, mockAudit, mockAccount);
  });

  it('should PASS when SUM(debit) === SUM(credit)', () => {
    const lines = [
      { accountId: 'acc-cash', debit: 5000, credit: 0 },
      { accountId: 'acc-sales', debit: 0, credit: 5000 },
    ];

    expect(() => service.validateJournalEntry(lines)).not.toThrow();
    const result = service.validateJournalEntry(lines);
    expect(result.totalDebit).toBe(5000);
    expect(result.totalCredit).toBe(5000);
  });

  it('should REJECT when SUM(debit) !== SUM(credit)', () => {
    const unbalancedLines = [
      { accountId: 'acc-cash', debit: 5000, credit: 0 },
      { accountId: 'acc-sales', debit: 0, credit: 4500 }, // Unbalanced by 500!
    ];

    expect(() => service.validateJournalEntry(unbalancedLines)).toThrow(BadRequestException);
  });

  it('should REJECT when journal entry has fewer than 2 lines', () => {
    const singleLine = [{ accountId: 'acc-cash', debit: 5000, credit: 0 }];

    expect(() => service.validateJournalEntry(singleLine)).toThrow(BadRequestException);
  });
});
