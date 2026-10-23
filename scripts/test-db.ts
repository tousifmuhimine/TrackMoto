import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [services, expenses, customers, customerDues, dueEntries] = await Promise.all([
    prisma.service.count(),
    prisma.expense.count(),
    prisma.customer.count(),
    prisma.customerDue.count(),
    prisma.dueEntry.count(),
  ]);

  console.log("Neon Postgres Database Verification:");
  console.log("Services:", services);
  console.log("Expenses:", expenses);
  console.log("Customers:", customers);
  console.log("Customer Dues:", customerDues);
  console.log("Bidirectional Due Entries:", dueEntries);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
