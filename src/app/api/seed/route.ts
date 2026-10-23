import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Create or get Customers
    const customer1 = await prisma.customer.upsert({
      where: { phone: "01711223344" },
      update: {},
      create: {
        name: "Rahim Mia",
        phone: "01711223344",
        address: "Mirpur 10, Dhaka",
        tag: "REGULAR",
      },
    });

    const customer2 = await prisma.customer.upsert({
      where: { phone: "01822334455" },
      update: {},
      create: {
        name: "Karim Uddin",
        phone: "01822334455",
        address: "Pallabi, Dhaka",
        tag: "VIP",
      },
    });

    const customer3 = await prisma.customer.upsert({
      where: { phone: "01933445566" },
      update: {},
      create: {
        name: "Tanvir Ahmed",
        phone: "01933445566",
        address: "Kazipara, Dhaka",
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
          registrationNo: "Dhaka Metro-Ha-14-1122",
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
          registrationNo: "Dhaka Metro-La-21-4455",
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
        notes: "Full servicing + Motul 10W-40 + Brake Shoe change",
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
        notes: "Engine tuning + Clutch plates + Mobil 1 oil",
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
        notes: "Remaining ৳2850 to be paid next week",
      },
    });

    await prisma.installmentPayment.create({
      data: {
        customerDueId: customerDue.id,
        amount: 3000,
        method: "BKASH",
        date: today,
        note: "Initial payment via bKash at time of delivery",
      },
    });

    // 4. Expenses for today
    await prisma.expense.createMany({
      data: [
        {
          date: today,
          description: "দোকানের বিদ্যুৎ বিল (Electricity Bill)",
          amount: 1200,
          category: "UTILITIES",
        },
        {
          date: today,
          description: "ইঞ্জিন অয়েল পাইকারি ক্রয় (Wholesale Mobil Box)",
          amount: 4500,
          category: "PURCHASE",
        },
        {
          date: today,
          description: "মেকানিক ও কাস্টমারদের চা-নাস্তা (Snacks & Tea)",
          amount: 250,
          category: "MISC",
        },
      ],
    });

    // 5. Bidirectional Dues (We owe & They owe)
    const party = await prisma.dueParty.create({
      data: {
        name: "Rahman Auto Parts (রহমান অটো পার্টস)",
        phone: "01755667788",
        type: "SUPPLIER",
        address: "Banglamotor, Dhaka",
      },
    });

    // We owe them for spare parts
    await prisma.dueEntry.create({
      data: {
        partyId: party.id,
        direction: "PAYABLE", // আমরা দেবো
        reason: "১ কার্টুন ব্রেক শু ও চেইন স্প্রোকেট বাকিতে ক্রয়",
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
        direction: "RECEIVABLE", // আমরা পাবো
        reason: "ডেলিভারি বাইকের ইঞ্জিন কাজ ও পেইন্টিং বিল",
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
        workshopName: "TrackMoto Bike Workshop",
        address: "Plot 12, Mirpur 10, Dhaka - 1216",
        phone: "+880 1711-223344",
        currency: "৳",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully!",
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: error.message },
      { status: 500 }
    );
  }
}
