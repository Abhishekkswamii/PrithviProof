import { EmissionFactor } from "./models";

export const FACTOR_VERSION = "2026.1";

export const localFactors: EmissionFactor[] = [
  // Transport
  {
    id: "f-car-gas",
    category: "transport",
    name: "Gasoline Passenger Car",
    value: 0.192, // kgCO2e per km
    unit: "km",
    uncertaintyPercent: 15, // varying efficiency and traffic
    provenance: {
      sourceName: "EPA GHG Emission Factors Hub",
      year: 2024,
      geography: "US",
      url: "https://www.epa.gov/climateleadership/ghg-emission-factors-hub"
    }
  },
  {
    id: "f-flight-short",
    category: "transport",
    name: "Short-haul Flight (<500km)",
    value: 0.254, // kgCO2e per passenger km
    unit: "km",
    uncertaintyPercent: 20, // altitude impacts, load factors
    provenance: {
      sourceName: "DEFRA Conversion Factors",
      year: 2023,
      geography: "Global",
    }
  },
  // Energy
  {
    id: "f-grid-us-avg",
    category: "energy",
    name: "US Average Grid Electricity",
    value: 0.385, // kgCO2e per kWh
    unit: "kWh",
    uncertaintyPercent: 10,
    provenance: {
      sourceName: "eGRID",
      year: 2023,
      geography: "US",
    }
  },
  {
    id: "f-gas-heat",
    category: "energy",
    name: "Natural Gas Heating",
    value: 5.3, // kgCO2e per therm
    unit: "therms",
    uncertaintyPercent: 5, // chemically consistent
    provenance: {
      sourceName: "EPA GHG Emission Factors Hub",
      year: 2024,
      geography: "US",
    }
  },
  // Food
  {
    id: "f-beef",
    category: "food",
    name: "Beef (Herd)",
    value: 99.48, // kgCO2e per kg
    unit: "kg",
    uncertaintyPercent: 40, // high variability in farming practices
    provenance: {
      sourceName: "Poore & Nemecek",
      year: 2018,
      geography: "Global",
    }
  },
  {
    id: "f-plant-based",
    category: "food",
    name: "Plant-based Diet Average",
    value: 1.5, // kgCO2e per kg
    unit: "kg",
    uncertaintyPercent: 25,
    provenance: {
      sourceName: "Poore & Nemecek",
      year: 2018,
      geography: "Global",
    }
  },
  // Purchases
  {
    id: "f-clothing",
    category: "purchases",
    name: "General Clothing",
    value: 0.05, // kgCO2e per USD
    unit: "USD",
    uncertaintyPercent: 50, // spend-based is highly uncertain
    provenance: {
      sourceName: "EXIOBASE",
      year: 2022,
      geography: "Global",
    }
  },
  // Waste
  {
    id: "f-landfill",
    category: "waste",
    name: "Municipal Solid Waste (Landfill)",
    value: 0.6, // kgCO2e per kg
    unit: "kg",
    uncertaintyPercent: 30, // methane capture varies
    provenance: {
      sourceName: "EPA WARM Model",
      year: 2023,
      geography: "US",
    }
  }
];

export function getFactorById(id: string): EmissionFactor | undefined {
  return localFactors.find(f => f.id === id);
}
