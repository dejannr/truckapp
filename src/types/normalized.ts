export type NormalizedLoad = {
  loadId?: string;
  clientId: string;
  weekId: string;
  truckId?: string;
  driverId?: string;
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  pickupDate?: string;
  deliveryDate?: string;
  revenue?: number;
  loadedMiles?: number;
  deadheadMiles?: number;
  broker?: string;
  commodity?: string;
  notes?: string;
};

export type NormalizedFuelTransaction = {
  clientId: string;
  weekId: string;
  truckId?: string;
  driverId?: string;
  date?: string;
  gallons?: number;
  totalCost?: number;
  pricePerGallon?: number;
  location?: string;
  odometer?: number;
};

export type NormalizedMaintenanceRecord = {
  clientId: string;
  weekId: string;
  truckId?: string;
  date?: string;
  category?: string;
  description?: string;
  cost?: number;
  vendor?: string;
};

export type NormalizedDriver = {
  clientId: string;
  driverId?: string;
  name?: string;
  assignedTruckId?: string;
  status?: string;
};

export type NormalizedTruck = {
  clientId: string;
  truckId?: string;
  unitNumber?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  status?: string;
};

export type NormalizedDataBundle = {
  loads: NormalizedLoad[];
  fuelTransactions: NormalizedFuelTransaction[];
  maintenanceRecords: NormalizedMaintenanceRecord[];
  drivers: NormalizedDriver[];
  trucks: NormalizedTruck[];
};

export type ImportResult = {
  filesProcessed: number;
  warnings: string[];
  errors: string[];
  normalizedCounts: {
    loads: number;
    fuelTransactions: number;
    maintenanceRecords: number;
    drivers: number;
    trucks: number;
  };
};
