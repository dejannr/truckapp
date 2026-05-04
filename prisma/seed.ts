import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { addDays, formatISO, startOfWeek } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { processReportingWeek } from "../src/lib/processing/importers/processReportingWeek";
import { generateNarrativesForWeek } from "../src/lib/processing/narratives/generateNarrativesForWeek";

const prisma = new PrismaClient();

async function writeWeekFiles(clientId: string, weekId: string, weekStart: Date, variant: "W1" | "W2") {
  const dir = path.join("uploads", `client-${clientId}`, `week-${formatISO(weekStart, { representation: "date" })}`);
  await fs.mkdir(dir, { recursive: true });

  await prisma.uploadedFile.deleteMany({ where: { reportingWeekId: weekId } });

  const suffix = Date.now();
  const files: Array<{ name: string; mime: string; type: any; confidence: number; content: string }> = [
    {
      name: `loads_${variant}.csv`,
      mime: "text/csv",
      type: "LOADS",
      confidence: 0.98,
      content:
        variant === "W1"
          ? [
              "loadId,truckId,driverId,originCity,originState,destinationCity,destinationState,revenue,loadedMiles,deadheadMiles",
              "L-1001,T-04,D-01,Dallas,TX,Atlanta,GA,3250,860,90",
              "L-1002,T-09,D-03,Nashville,TN,Charlotte,NC,2880,790,110",
              "L-1003,T-02,D-05,Chicago,IL,Columbus,OH,2150,520,120",
              "L-1004,T-11,D-08,Memphis,TN,Orlando,FL,3320,910,170",
              "L-1005,T-07,D-02,Phoenix,AZ,Las Vegas,NV,1260,310,130",
              "L-1006,T-04,D-01,Atlanta,GA,Dallas,TX,3010,845,95"
            ].join("\n")
          : [
              "loadId,truckId,driverId,originCity,originState,destinationCity,destinationState,revenue,loadedMiles,deadheadMiles",
              "L-2001,T-04,D-01,Dallas,TX,Atlanta,GA,3410,870,95",
              "L-2002,T-09,D-03,Nashville,TN,Charlotte,NC,2790,780,125",
              "L-2003,T-02,D-05,Chicago,IL,Columbus,OH,2050,500,150",
              "L-2004,T-11,D-08,Memphis,TN,Orlando,FL,3150,880,210",
              "L-2005,T-07,D-02,Phoenix,AZ,Las Vegas,NV,1140,295,180",
              "L-2006,T-04,D-01,Atlanta,GA,Dallas,TX,3190,850,105"
            ].join("\n"),
    },
    {
      name: `fuel_${variant}.csv`,
      mime: "text/csv",
      type: "FUEL",
      confidence: 0.96,
      content:
        variant === "W1"
          ? [
              "date,truckId,driverId,gallons,totalCost,pricePerGallon,station,odometer",
              "2026-03-10,T-04,D-01,112,431.20,3.85,Dallas Fuel,124500",
              "2026-03-11,T-09,D-03,105,404.25,3.85,Nashville Stop,208400",
              "2026-03-12,T-02,D-05,98,377.30,3.85,Chicago Fuel,178200",
              "2026-03-13,T-11,D-08,122,469.70,3.85,Memphis Petro,231000",
              "2026-03-13,T-07,D-02,96,369.60,3.85,Phoenix Fuel,199100"
            ].join("\n")
          : [
              "date,truckId,driverId,gallons,totalCost,pricePerGallon,station,odometer",
              "2026-03-17,T-04,D-01,118,466.10,3.95,Dallas Fuel,125650",
              "2026-03-18,T-09,D-03,110,434.50,3.95,Nashville Stop,209750",
              "2026-03-19,T-02,D-05,102,402.90,3.95,Chicago Fuel,179300",
              "2026-03-20,T-11,D-08,129,509.55,3.95,Memphis Petro,232600",
              "2026-03-20,T-07,D-02,109,430.55,3.95,Phoenix Fuel,200350"
            ].join("\n"),
    },
    {
      name: `maintenance_${variant}.csv`,
      mime: "text/csv",
      type: "MAINTENANCE",
      confidence: 0.93,
      content:
        variant === "W1"
          ? [
              "date,truckId,category,description,cost,vendor",
              "2026-03-10,T-07,Tires,Drive tire replacement,980,Desert Tire",
              "2026-03-12,T-09,PM,Preventive maintenance,420,Quick Service",
              "2026-03-13,T-04,Repair,Brake adjustment,260,RoadPro Shop"
            ].join("\n")
          : [
              "date,truckId,category,description,cost,vendor",
              "2026-03-17,T-07,Tires,Steer tire replacement,1190,Desert Tire",
              "2026-03-19,T-09,PM,Preventive maintenance,440,Quick Service",
              "2026-03-20,T-11,Repair,Cooling system service,610,South Fleet Care"
            ].join("\n"),
    },
    {
      name: `drivers_${variant}.csv`,
      mime: "text/csv",
      type: "DRIVERS",
      confidence: 0.9,
      content: [
        "driverId,name,assignedTruckId,status,phone,license",
        "D-01,Mark Turner,T-04,ACTIVE,555-1001,A1234",
        "D-02,Alex Moore,T-07,ACTIVE,555-1002,B3456",
        "D-03,Nina Cole,T-09,ACTIVE,555-1003,C2468",
        "D-05,Ryan West,T-02,ACTIVE,555-1005,D1357",
        "D-08,Sam Reed,T-11,ACTIVE,555-1008,E9981"
      ].join("\n"),
    },
    {
      name: `trucks_${variant}.csv`,
      mime: "text/csv",
      type: "TRUCKS",
      confidence: 0.9,
      content: [
        "truckId,unitNumber,vin,make,model,year,status",
        "T-04,104,1FTAA1,Freightliner,Cascadia,2021,ACTIVE",
        "T-07,107,2ABBB2,Volvo,VNL,2020,ACTIVE",
        "T-09,109,3CCCC3,Kenworth,T680,2022,ACTIVE",
        "T-11,111,4DDDD4,Peterbilt,579,2019,ACTIVE",
        "T-02,102,5EEEE5,International,LT625,2021,ACTIVE"
      ].join("\n"),
    }
  ];

  for (const file of files) {
    const storedPath = path.join(dir, `${suffix}-${file.name}`);
    await fs.writeFile(storedPath, file.content, "utf8");

    await prisma.uploadedFile.create({
      data: {
        clientId,
        reportingWeekId: weekId,
        originalName: file.name,
        storedPath,
        mimeType: file.mime,
        fileType: file.type,
        classificationConfidence: file.confidence,
        processed: true,
      },
    });
  }
}

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const clientHash = await bcrypt.hash("client123", 10);

  const client = await prisma.client.upsert({
    where: { slug: "demo-logistics" },
    create: {
      name: "Demo Logistics",
      slug: "demo-logistics",
      contactName: "Mia Carter",
      email: "ops@demologistics.test",
      assumptions: {
        create: {
          defaultMpg: 6.4,
          defaultFuelPrice: 3.85,
          defaultMaintenancePerMile: 0.1,
          defaultFixedCostPerTruck: 950,
        },
      },
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    create: { email: "admin@test.com", passwordHash: adminHash, role: "ADMIN" },
    update: { passwordHash: adminHash },
  });

  await prisma.user.upsert({
    where: { email: "client@test.com" },
    create: { email: "client@test.com", passwordHash: clientHash, role: "CLIENT", clientId: client.id },
    update: { passwordHash: clientHash, clientId: client.id },
  });

  const weekStarts = [
    startOfWeek(new Date("2026-03-09"), { weekStartsOn: 1 }),
    startOfWeek(new Date("2026-03-16"), { weekStartsOn: 1 }),
  ];

  const weeks = [];
  for (const [i, ws] of weekStarts.entries()) {
    const week = await prisma.reportingWeek.upsert({
      where: { clientId_weekStart: { clientId: client.id, weekStart: ws } },
      create: {
        clientId: client.id,
        weekStart: ws,
        weekEnd: addDays(ws, 6),
        label: `Week of ${formatISO(ws, { representation: "date" })}`,
        status: "DRAFT",
      },
      update: {
        weekEnd: addDays(ws, 6),
        label: `Week of ${formatISO(ws, { representation: "date" })}`,
        status: "DRAFT",
      },
    });

    await writeWeekFiles(client.id, week.id, ws, i === 0 ? "W1" : "W2");
    weeks.push(week);
  }

  for (const week of weeks) {
    await processReportingWeek(week.id);
    await generateNarrativesForWeek(week.id, { mode: "single" });
    await prisma.reportingWeek.update({ where: { id: week.id }, data: { status: "PUBLISHED" } });
  }

  console.log("Seed complete with fully populated processed demo data for 2 weeks.");
}

main().finally(async () => prisma.$disconnect());
