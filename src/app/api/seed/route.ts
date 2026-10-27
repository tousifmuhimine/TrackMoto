import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Create or get Customers
    const customer1 = await prisma.customer.upsert({
      where: { phone: "+1 234 567 8901" },
      update: {},
      create: {
        name: "David Miller",
        phone: "+1 234 567 8901",
        address: "Downtown, 5th Avenue",
        tag: "REGULAR",
      },
    });

    const customer2 = await prisma.customer.upsert({
      where: { phone: "+1 234 567 8902" },
      update: {},
      create: {
        name: "Robert Evans",
        phone: "+1 234 567 8902",
        address: "Westside Industrial Area",
        tag: "VIP",
      },
    });

    const customer3 = await prisma.customer.upsert({
      where: { phone: "+1 234 567 8903" },
      update: {},
      create: {
        name: "Alex Morgan",
        phone: "+1 234 567 8903",
        address: "North Boulevard",
        tag: "NEW",
      },
    });

    // 2. Bikes
    let bike1 = await prisma.bike.findFirst({ where: { customerId: customer1.id } });
    if (!bike1) {
      bike1 = await prisma.bike.create({
        data: {
          customerId: customer1.id,
          model: "Bajaj Pulsar 150",
          registrationNo: "REG-1044",
          color: "Black-Red",
        },
      });
    }

    let bike2 = await prisma.bike.findFirst({ where: { customerId: customer2.id } });
    if (!bike2) {
      bike2 = await prisma.bike.create({
        data: {
          customerId: customer2.id,
          model: "Yamaha FZS V3",
          registrationNo: "REG-2088",
          color: "Matte Blue",
        },
      });
    }

    // 3. Services
    const today = new Date();
    const service1 = await prisma.service.create({
      data: {
        date: today,
        customerId: customer1.id,
        bikeId: bike1.id,
        serviceCharge: 600,
        sparePartsCost: 1200,
        engineOilCost: 550,
        extraCharges: 100,
        totalIncome: 2450,
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        amountPaid: 2450,
        notes: "Full servicing, Motul 10W-40, brake shoe replacement",
      },
    });

    const service2 = await prisma.service.create({
      data: {
        date: today,
        customerId: customer2.id,
        bikeId: bike2.id,
        serviceCharge: 1500,
        sparePartsCost: 3500,
        engineOilCost: 650,
        extraCharges: 200,
        totalIncome: 5850,
        paymentStatus: "PARTIAL",
        paymentMethod: "BKASH",
        amountPaid: 3000,
        notes: "Engine tuning, clutch plates replacement, Mobil 1 synthetic",
      },
    });

    // Auto create CustomerDue for Service 2
    const customerDue = await prisma.customerDue.create({
      data: {
        date: today,
        customerId: customer2.id,
        serviceId: service2.id,
        bikeId: bike2.id,
        customerName: customer2.name,
        bikeName: bike2.model,
        totalAmount: 5850,
        paidAmount: 3000,
        remainingAmount: 2850,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "PARTIAL",
        notes: "Remaining BDT 2,850 to be paid on next visit",
      },
    });

    await prisma.installmentPayment.create({
      data: {
        customerDueId: customerDue.id,
        amount: 3000,
        method: "BKASH",
        date: today,
        note: "Initial upfront payment at bike pickup",
      },
    });

    // 4. Expenses for today
    await prisma.expense.createMany({
      data: [
        {
          date: today,
          description: "Workshop Monthly Electricity Bill",
          amount: 1200,
          category: "UTILITIES",
        },
        {
          date: today,
          description: "Wholesale Engine Oil Restock Box (Motul & Castrol)",
          amount: 4500,
          category: "PURCHASE",
        },
        {
          date: today,
          description: "Staff & Customer Refreshments",
          amount: 250,
          category: "MISC",
        },
      ],
    });

    // 5. Bidirectional Dues (We owe & They owe)
    const party = await prisma.dueParty.create({
      data: {
        name: "Rahman Auto Parts Wholesale",
        phone: "+1 234 567 8999",
        type: "SUPPLIER",
        address: "Commercial Market Road",
      },
    });

    // We owe them for spare parts
    await prisma.dueEntry.create({
      data: {
        partyId: party.id,
        direction: "PAYABLE",
        reason: "Carton of brake pads and chain sprockets on credit",
        totalAmount: 15000,
        paidAmount: 5000,
        remainingAmount: 10000,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "PARTIAL",
      },
    });

    // They owe us for repair work done on their delivery bike
    await prisma.dueEntry.create({
      data: {
        partyId: party.id,
        direction: "RECEIVABLE",
        reason: "Engine overhaul and body painting for delivery motorcycle",
        totalAmount: 3500,
        paidAmount: 0,
        remainingAmount: 3500,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "UNPAID",
      },
    });

    // 6. Settings
    await prisma.workshopSettings.upsert({
      where: { id: "default" },
      update: {},
      create: {
        id: "default",
        workshopName: "Carbon 8 Workshop",
        address: "Plot 12, Main Road, Dhaka - 1216",
        phone: "+880 1711-223344",
        currency: "BDT",
      },
    });

    return NextResponse.json({
      success: true,
      message: "English sample data seeded successfully!",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: error.message },
      { status: 500 }
    );
  }
}
