import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/shared/lib/prisma";
import type {
  BillingDocumentType,
  BillingSettings,
} from "../../domain/entities/billing-settings";
import {
  DEFAULT_DOCUMENT_CONFIGS,
  formatDocumentNumber,
} from "../../domain/rules/billing-settings-rules";
import type {
  IBillingSettingsRepository,
  SaveBillingSettingsInput,
  AllocatedDocumentNumber,
} from "../../domain/repositories/billing-settings-repository";
import { toDomainBillingSettings } from "../mappers/prisma-billing-settings-mapper";

export class PrismaBillingSettingsRepository implements IBillingSettingsRepository {
  async getSettings(
    organizationId: string,
    documentType: BillingDocumentType,
    txClient?: unknown,
  ): Promise<BillingSettings> {
    const prisma = (txClient as ReturnType<typeof getPrisma>) ?? getPrisma();
    const row = await prisma.billingSettings.findUnique({
      where: {
        organizationId_documentType: {
          organizationId,
          documentType,
        },
      },
    });

    if (row) {
      return toDomainBillingSettings(row);
    }

    // Fall back to clean domain defaults for this document type
    const def = DEFAULT_DOCUMENT_CONFIGS[documentType];
    let nextNum = def.nextNumber;

    if (documentType === "INVOICE") {
      let candidate = formatDocumentNumber({
        prefix: def.prefix,
        suffix: def.suffix,
        padding: def.padding,
        nextNumber: nextNum,
      });

      while (true) {
        const existing = await prisma.invoice.findUnique({
          where: {
            organizationId_invoiceNumber: {
              organizationId,
              invoiceNumber: candidate,
            },
          },
          select: { id: true },
        });

        if (!existing) {
          break;
        }

        nextNum++;
        candidate = formatDocumentNumber({
          prefix: def.prefix,
          suffix: def.suffix,
          padding: def.padding,
          nextNumber: nextNum,
        });
      }
    } else if (documentType === "CREDIT_NOTE") {
      let candidate = formatDocumentNumber({
        prefix: def.prefix,
        suffix: def.suffix,
        padding: def.padding,
        nextNumber: nextNum,
      });

      while (true) {
        const existing = await prisma.creditNote?.findUnique({
          where: {
            organizationId_creditNoteNumber: {
              organizationId,
              creditNoteNumber: candidate,
            },
          },
          select: { id: true },
        });

        if (!existing) {
          break;
        }

        nextNum++;
        candidate = formatDocumentNumber({
          prefix: def.prefix,
          suffix: def.suffix,
          padding: def.padding,
          nextNumber: nextNum,
        });
      }
    }

    return {
      id: `default_${documentType.toLowerCase()}`,
      organizationId,
      documentType,
      prefix: def.prefix,
      suffix: def.suffix,
      nextNumber: nextNum,
      padding: def.padding,
      defaultNotes: def.defaultNotes,
      defaultTerms: def.defaultTerms,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getAllSettings(
    organizationId: string,
    txClient?: unknown,
  ): Promise<Record<BillingDocumentType, BillingSettings>> {
    const prisma = (txClient as ReturnType<typeof getPrisma>) ?? getPrisma();
    const rows = await prisma.billingSettings.findMany({
      where: { organizationId },
    });

    const map = new Map<BillingDocumentType, BillingSettings>();
    for (const row of rows) {
      const entity = toDomainBillingSettings(row);
      map.set(entity.documentType, entity);
    }

    const allTypes: BillingDocumentType[] = [
      "INVOICE",
      "DEBIT_NOTE",
      "CREDIT_NOTE",
      "RECURRING_INVOICE",
    ];

    const result = {} as Record<BillingDocumentType, BillingSettings>;
    for (const t of allTypes) {
      if (map.has(t)) {
        result[t] = map.get(t)!;
      } else {
        const def = DEFAULT_DOCUMENT_CONFIGS[t];
        result[t] = {
          id: `default_${t.toLowerCase()}`,
          organizationId,
          documentType: t,
          prefix: def.prefix,
          suffix: def.suffix,
          nextNumber: def.nextNumber,
          padding: def.padding,
          defaultNotes: def.defaultNotes,
          defaultTerms: def.defaultTerms,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    }

    return result;
  }

  async saveSettings(
    organizationId: string,
    input: SaveBillingSettingsInput,
    txClient?: unknown,
  ): Promise<BillingSettings> {
    const prisma = (txClient as ReturnType<typeof getPrisma>) ?? getPrisma();
    const def = DEFAULT_DOCUMENT_CONFIGS[input.documentType];

    const existingRow = await prisma.billingSettings.findUnique({
      where: {
        organizationId_documentType: {
          organizationId,
          documentType: input.documentType,
        },
      },
    });

    let nextNumberToSet = existingRow ? existingRow.nextNumber : (input.nextNumber ?? def.nextNumber);

    // If an explicit sequence number was provided and differs from the current saved sequence:
    if (input.nextNumber !== undefined && (!existingRow || input.nextNumber !== existingRow.nextNumber)) {
      if (input.documentType === "INVOICE") {
        const candidateNumber = formatDocumentNumber({
          prefix: input.prefix ?? existingRow?.prefix ?? def.prefix,
          suffix: input.suffix !== undefined ? input.suffix : existingRow?.suffix ?? def.suffix,
          padding: input.padding ?? existingRow?.padding ?? def.padding,
          nextNumber: input.nextNumber,
        });

        const collision = await prisma.invoice.findUnique({
          where: {
            organizationId_invoiceNumber: {
              organizationId,
              invoiceNumber: candidateNumber,
            },
          },
          select: { id: true },
        });

        if (collision) {
          throw new Error(
            `Cannot set sequence number to ${input.nextNumber}: invoice ${candidateNumber} already exists.`,
          );
        }
      } else if (input.documentType === "CREDIT_NOTE") {
        const candidateNumber = formatDocumentNumber({
          prefix: input.prefix ?? existingRow?.prefix ?? def.prefix,
          suffix: input.suffix !== undefined ? input.suffix : existingRow?.suffix ?? def.suffix,
          padding: input.padding ?? existingRow?.padding ?? def.padding,
          nextNumber: input.nextNumber,
        });

        const collision = await prisma.creditNote?.findUnique({
          where: {
            organizationId_creditNoteNumber: {
              organizationId,
              creditNoteNumber: candidateNumber,
            },
          },
          select: { id: true },
        });

        if (collision) {
          throw new Error(
            `Cannot set sequence number to ${input.nextNumber}: credit note ${candidateNumber} already exists.`,
          );
        }
      }
      nextNumberToSet = input.nextNumber;
    }

    const row = await prisma.billingSettings.upsert({
      where: {
        organizationId_documentType: {
          organizationId,
          documentType: input.documentType,
        },
      },
      create: {
        id: `bset_${crypto.randomUUID()}`,
        organizationId,
        documentType: input.documentType,
        prefix: input.prefix ?? def.prefix,
        suffix: input.suffix ?? def.suffix,
        nextNumber: nextNumberToSet,
        padding: input.padding ?? def.padding,
        defaultNotes: input.defaultNotes !== undefined ? input.defaultNotes : def.defaultNotes,
        defaultTerms: input.defaultTerms !== undefined ? input.defaultTerms : def.defaultTerms,
      },
      update: {
        ...(input.prefix !== undefined && { prefix: input.prefix }),
        ...(input.suffix !== undefined && { suffix: input.suffix }),
        nextNumber: nextNumberToSet,
        ...(input.padding !== undefined && { padding: input.padding }),
        ...(input.defaultNotes !== undefined && { defaultNotes: input.defaultNotes }),
        ...(input.defaultTerms !== undefined && { defaultTerms: input.defaultTerms }),
      },
    });

    return toDomainBillingSettings(row);
  }

  async allocateNextNumber(
    organizationId: string,
    documentType: BillingDocumentType,
    txClient?: Prisma.TransactionClient,
  ): Promise<AllocatedDocumentNumber> {
    const runAllocation = async (tx: Prisma.TransactionClient): Promise<AllocatedDocumentNumber> => {
      const def = DEFAULT_DOCUMENT_CONFIGS[documentType];

      // 1. Ensure a billing_settings row exists atomically
      await tx.$executeRaw`
        INSERT INTO billing_settings ("id", "organizationId", "documentType", "prefix", "suffix", "nextNumber", "padding", "createdAt", "updatedAt")
        VALUES (${`bset_${crypto.randomUUID()}`}, ${organizationId}, ${documentType}::"BillingDocumentType", ${def.prefix}, ${def.suffix ?? null}, ${def.nextNumber}, ${def.padding}, NOW(), NOW())
        ON CONFLICT ("organizationId", "documentType") DO NOTHING
      `;

      // 2. Lock the billing_settings row exclusively with FOR UPDATE to serialize concurrent allocations
      const lockedRows = await tx.$queryRaw<Array<{
        id: string;
        prefix: string;
        suffix: string | null;
        nextNumber: number;
        padding: number;
      }>>`
        SELECT "id", "prefix", "suffix", "nextNumber", "padding"
        FROM billing_settings
        WHERE "organizationId" = ${organizationId} AND "documentType" = ${documentType}::"BillingDocumentType"
        FOR UPDATE
      `;

      const record = lockedRows[0];
      if (!record) {
        throw new Error(
          `Failed to locate and lock billing settings for ${organizationId} - ${documentType}`,
        );
      }

      // 3. Find next available sequence number that does not collide with existing invoices
      let currentSeq = record.nextNumber;
      let candidateNumber = formatDocumentNumber({
        prefix: record.prefix,
        suffix: record.suffix,
        nextNumber: currentSeq,
        padding: record.padding,
      });

      if (documentType === "INVOICE") {
        while (true) {
          const existing = await tx.invoice.findUnique({
            where: {
              organizationId_invoiceNumber: {
                organizationId,
                invoiceNumber: candidateNumber,
              },
            },
            select: { id: true },
          });

          if (!existing) {
            break;
          }

          currentSeq++;
          candidateNumber = formatDocumentNumber({
            prefix: record.prefix,
            suffix: record.suffix,
            nextNumber: currentSeq,
            padding: record.padding,
          });
        }
      } else if (documentType === "CREDIT_NOTE") {
        while (true) {
          const existing = await tx.creditNote?.findUnique({
            where: {
              organizationId_creditNoteNumber: {
                organizationId,
                creditNoteNumber: candidateNumber,
              },
            },
            select: { id: true },
          });

          if (!existing) {
            break;
          }

          currentSeq++;
          candidateNumber = formatDocumentNumber({
            prefix: record.prefix,
            suffix: record.suffix,
            nextNumber: currentSeq,
            padding: record.padding,
          });
        }
      }

      // 4. Update the sequence in billing_settings to currentSeq + 1
      await tx.billingSettings.update({
        where: { id: record.id },
        data: {
          nextNumber: currentSeq + 1,
        },
      });

      return {
        allocatedNumber: candidateNumber,
        nextNumber: currentSeq + 1,
      };
    };

    if (txClient) {
      return await runAllocation(txClient);
    }

    const prisma = getPrisma();
    return await prisma.$transaction(async (tx) => {
      return await runAllocation(tx);
    });
  }
}

export const billingSettingsRepository = new PrismaBillingSettingsRepository();
