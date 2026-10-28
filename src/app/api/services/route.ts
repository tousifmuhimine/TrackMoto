import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    let whereClause: any = {};

    if (dateStr) {
      const parts = dateStr.split("T")[0].split("-").map(Number);
      const startOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59, 999));

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999);

      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        customer: true,
        bike: true,
        serviceItems: {
          include: {
            inventoryItem: true,
          },
        },
        customerDues: {
          include: {
            installments: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      date,
      customerName,
      customerPhone,
      bikeModel,
      bikeReg,
      runningKm,
      saleType = "SERVICE",
      serviceCharge = 0,
      sparePartsCost = 0,
      engineOilCost = 0,
      extraCharges = 0,
      paymentStatus = "PAID",
      paymentMethod = "CASH",
      transactionId,
      amountPaid = 0,
      dueDate,
      notes,
    } = body;

    const totalIncome =
      Number(serviceCharge || 0) +
      Number(sparePartsCost || 0) +
      Number(engineOilCost || 0) +
      Number(extraCharges || 0);

    let serviceDate = new Date();
    if (date) {
      if (typeof date === "string" && date.includes("-")) {
        const parts = date.split("T")[0].split("-").map(Number);
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          serviceDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
        } else {
          serviceDate = new Date(date);
        }
      } else {
        serviceDate = new Date(date);
      }
    }

    // 1. Find or create customer if name/phone is provided
    let customerId = body.customerId;
    if (!customerId && customerName && customerPhone) {
      const existing = await prisma.customer.findUnique({
        where: { phone: customerPhone },
      });
      if (existing) {
        customerId = existing.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
          },
        });
        customerId = newCustomer.id;
      }
    }

    // 2. Find or create bike if model provided
    let bikeId = body.bikeId;
    if (!bikeId && customerId && bikeModel) {
      const existingBike = await prisma.bike.findFirst({
        where: {
          customerId,
          model: bikeModel,
        },
      });
      if (existingBike) {
        bikeId = existingBike.id;
        if (runningKm) {
          await prisma.bike.update({
            where: { id: existingBike.id },
            data: { runningKm: parseInt(runningKm, 10) },
          });
        }
      } else {
        const newBike = await prisma.bike.create({
          data: {
            customerId,
            model: bikeModel,
            registrationNo: bikeReg || null,
            runningKm: runningKm ? parseInt(runningKm, 10) : null,
          },
        });
        bikeId = newBike.id;
      }
    }

    // 3. Create Service
    const service = await prisma.service.create({
      data: {
        date: serviceDate,
        customerId: customerId || null,
        bikeId: bikeId || null,
        saleType: saleType || "SERVICE",
        runningKm: runningKm ? parseInt(runningKm, 10) : null,
        serviceCharge: Number(serviceCharge || 0),
        sparePartsCost: Number(sparePartsCost || 0),
        engineOilCost: Number(engineOilCost || 0),
        extraCharges: Number(extraCharges || 0),
        totalIncome,
        paymentStatus,
        paymentMethod,
        transactionId: transactionId || null,
        amountPaid: Number(amountPaid || 0),
        notes,
      },
      include: {
        customer: true,
        bike: true,
      },
    });

    // 3.5 Deduct Inventory quantities and record ServiceItems if stock items were used/sold
    if (Array.isArray(body.inventoryItems) && body.inventoryItems.length > 0) {
      for (const item of body.inventoryItems) {
        if (item.inventoryItemId) {
          const qty = Math.max(1, parseInt(item.quantity || 1, 10));
          const unitPrice = Number(item.unitPrice || 0);

          // 1. Decrement stock quantity
          try {
            await prisma.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: {
                quantity: {
                  decrement: qty,
                },
              },
            });
          } catch (invErr) {
            console.warn("Could not decrement inventory item:", item.inventoryItemId, invErr);
          }

          // 2. Create ServiceItem link
          try {
            await prisma.serviceItem.create({
              data: {
                serviceId: service.id,
                inventoryItemId: item.inventoryItemId,
                description: item.description || "Stock Item",
                quantity: qty,
                unitPrice: unitPrice,
                total: unitPrice * qty,
              },
            });
          } catch (siErr) {
            console.warn("Could not create service item link:", siErr);
          }
        }
      }
    }

    // 4. Auto-create CustomerDue if status is DUE or PARTIAL
    if (paymentStatus === "DUE" || paymentStatus === "PARTIAL") {
      const paid = Number(amountPaid || 0);
      const remaining = Math.max(0, totalIncome - paid);

      const customerDue = await prisma.customerDue.create({
        data: {
          date: serviceDate,
          customerId: customerId || null,
          serviceId: service.id,
          bikeId: bikeId || null,
          customerName: customerName || (service.customer ? service.customer.name : "Walk-in"),
          bikeName: bikeModel || (service.bike ? service.bike.model : "Standard Bike"),
          totalAmount: totalIncome,
          paidAmount: paid,
          remainingAmount: remaining,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: remaining <= 0 ? "CLEARED" : paid > 0 ? "PARTIAL" : "UNPAID",
          notes: notes || `Created from service #${service.id.slice(-6)}`,
        },
      });

      // Record upfront payment installment if paid > 0
      if (paid > 0) {
        await prisma.installmentPayment.create({
          data: {
            customerDueId: customerDue.id,
            amount: paid,
            method: paymentMethod,
            transactionId: transactionId || null,
            date: serviceDate,
            note: "Upfront payment at service",
          },
        });
      }
    }

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create service:", error);
    return NextResponse.json(
      { error: "Failed to create service", details: error.message },
      { status: 500 }
    );
  }
}
