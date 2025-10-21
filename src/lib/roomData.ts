import kitchenModern from "@/assets/kitchen-modern.jpg";
import kitchenRustic from "@/assets/kitchen-rustic.jpg";
import kitchenIndustrial from "@/assets/kitchen-industrial.jpg";
import kitchenRetro from "@/assets/kitchen-retro.jpg";
import kitchenMinimalist from "@/assets/kitchen-minimalist.jpg";
import kitchenTraditional from "@/assets/kitchen-traditional.jpg";

import livingModern from "@/assets/living-modern.jpg";
import livingRustic from "@/assets/living-rustic.jpg";
import livingIndustrial from "@/assets/living-industrial.jpg";
import livingRetro from "@/assets/living-retro.jpg";
import livingMinimalist from "@/assets/living-minimalist.jpg";
import livingTraditional from "@/assets/living-traditional.jpg";

import garageModern from "@/assets/garage-modern.jpg";
import garageRustic from "@/assets/garage-rustic.jpg";
import garageIndustrial from "@/assets/garage-industrial.jpg";
import garageRetro from "@/assets/garage-retro.jpg";
import garageMinimalist from "@/assets/garage-minimalist.jpg";
import garageTraditional from "@/assets/garage-traditional.jpg";

import basementModern from "@/assets/basement-modern.jpg";
import basementRustic from "@/assets/basement-rustic.jpg";
import basementIndustrial from "@/assets/basement-industrial.jpg";
import basementRetro from "@/assets/basement-retro.jpg";
import basementMinimalist from "@/assets/basement-minimalist.jpg";
import basementTraditional from "@/assets/basement-traditional.jpg";

import officeLumber from "@/assets/office-lumber.jpg";
import officeTrader from "@/assets/office-trader.jpg";
import officeEngineer from "@/assets/office-engineer.jpg";
import officeExecutive from "@/assets/office-executive.jpg";
import officeCreative from "@/assets/office-creative.jpg";
import officeTelemarketer from "@/assets/office-telemarketer.jpg";

import neighborsRetired from "@/assets/neighbors-retired.jpg";
import neighborsYoung from "@/assets/neighbors-young.jpg";
import neighborsSingle from "@/assets/neighbors-single.jpg";
import neighborsFrat from "@/assets/neighbors-frat.jpg";
import neighborsAirbnb from "@/assets/neighbors-airbnb.jpg";
import neighborsCats from "@/assets/neighbors-cats.jpg";

import weatherSunny from "@/assets/weather-sunny.jpg";
import weatherCloudy from "@/assets/weather-cloudy.jpg";
import weatherRainy from "@/assets/weather-rainy.jpg";
import weatherHeatwave from "@/assets/weather-heatwave.jpg";
import weatherArctic from "@/assets/weather-arctic.jpg";
import weatherSharknado from "@/assets/weather-sharknado.jpg";

import sceneryForest from "@/assets/scenery-forest.jpg";
import sceneryMountain from "@/assets/scenery-mountain.jpg";
import sceneryDesert from "@/assets/scenery-desert.jpg";
import sceneryBeach from "@/assets/scenery-beach.jpg";
import sceneryCountryside from "@/assets/scenery-countryside.jpg";
import sceneryVolcano from "@/assets/scenery-volcano.jpg";

export interface RoomStyle {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

export interface RoomType {
  id: string;
  name: string;
  styles: RoomStyle[];
}

export const roomTypes: RoomType[] = [
  {
    id: "kitchen",
    name: "Kitchen",
    styles: [
      {
        id: "modern",
        name: "Modern",
        description: "Sleek lines, minimalist design, high-tech appliances",
        image: kitchenModern,
        price: 45000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Warm wood tones, vintage charm, cozy atmosphere",
        image: kitchenRustic,
        price: 38000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Exposed brick, metal fixtures, urban loft aesthetic",
        image: kitchenIndustrial,
        price: 42000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vibrant colors, nostalgic design, vintage appliances",
        image: kitchenRetro,
        price: 35000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean design, functional spaces, Scandinavian influence",
        image: kitchenMinimalist,
        price: 40000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic elegance, ornate details, timeless appeal",
        image: kitchenTraditional,
        price: 48000,
      },
    ],
  },
  {
    id: "living-room",
    name: "Living Room",
    styles: [
      {
        id: "modern",
        name: "Modern",
        description: "Contemporary furniture, open space, clean aesthetics",
        image: livingModern,
        price: 32000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Natural materials, cozy fireplace, warm textures",
        image: livingRustic,
        price: 28000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Raw materials, exposed elements, urban style",
        image: livingIndustrial,
        price: 30000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vintage furniture, bold patterns, nostalgic vibe",
        image: livingRetro,
        price: 26000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Essential furniture, neutral palette, spacious feel",
        image: livingMinimalist,
        price: 29000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic furniture, elegant details, formal layout",
        image: livingTraditional,
        price: 35000,
      },
    ],
  },
  {
    id: "garage",
    name: "Garage",
    styles: [
      {
        id: "modern",
        name: "Modern",
        description: "Smart systems, LED lighting, organized storage",
        image: garageModern,
        price: 18000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Wood finish, vintage tools display, workshop feel",
        image: garageRustic,
        price: 15000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Heavy-duty shelving, metal finishes, functional layout",
        image: garageIndustrial,
        price: 16000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Classic car theme, vintage signage, nostalgic decor",
        image: garageRetro,
        price: 14000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean storage, minimal clutter, efficient design",
        image: garageMinimalist,
        price: 15500,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic workbench, organized tools, timeless setup",
        image: garageTraditional,
        price: 17000,
      },
    ],
  },
  {
    id: "basement",
    name: "Basement",
    styles: [
      {
        id: "modern",
        name: "Modern",
        description: "Home theater, gaming zone, contemporary finish",
        image: basementModern,
        price: 35000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Man cave, wood paneling, comfortable lounge",
        image: basementRustic,
        price: 30000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Exposed ceiling, concrete floors, urban bar setup",
        image: basementIndustrial,
        price: 32000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vintage arcade, nostalgic memorabilia, fun atmosphere",
        image: basementRetro,
        price: 28000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Multi-purpose space, clean design, flexible layout",
        image: basementMinimalist,
        price: 31000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic rec room, wood finish, family gathering space",
        image: basementTraditional,
        price: 36000,
      },
    ],
  },
  {
    id: "home-office",
    name: "Home Office",
    styles: [
      {
        id: "lumber",
        name: "Lumber Baron",
        description: "Rich wood paneling, trophy heads, executive power vibes",
        image: officeLumber,
        price: 38000,
      },
      {
        id: "trader",
        name: "Day Trader",
        description: "Multiple monitors, stock charts, high-tech trading setup",
        image: officeTrader,
        price: 42000,
      },
      {
        id: "engineer",
        name: "Software Solutions Engineer",
        description: "Minimalist desk, ergonomic chair, clean tech aesthetic",
        image: officeEngineer,
        price: 35000,
      },
      {
        id: "executive",
        name: "Executive Suite",
        description: "Mahogany desk, leather chair, corporate prestige",
        image: officeExecutive,
        price: 45000,
      },
      {
        id: "creative",
        name: "Creative Studio",
        description: "Colorful inspiration, design sketches, artistic workspace",
        image: officeCreative,
        price: 33000,
      },
      {
        id: "telemarketer",
        name: "Telemarketer Dungeon",
        description: "Basement cubicle, flickering lights, existential dread included",
        image: officeTelemarketer,
        price: 5000,
      },
    ],
  },
  {
    id: "neighbors",
    name: "Neighbors",
    styles: [
      {
        id: "retired",
        name: "Retired Couple",
        description: "Peaceful, well-maintained, friendly wave guarantee",
        image: neighborsRetired,
        price: 5000,
      },
      {
        id: "young",
        name: "Young Couple",
        description: "Modern, energetic, weekend BBQ invitations",
        image: neighborsYoung,
        price: 6000,
      },
      {
        id: "single",
        name: "Single Professional",
        description: "Quiet, respectful, perfect for privacy",
        image: neighborsSingle,
        price: 5500,
      },
      {
        id: "frat",
        name: "Frat House",
        description: "Lively parties, loud music, questionable decisions",
        image: neighborsFrat,
        price: 2000,
      },
      {
        id: "airbnb",
        name: "Airbnb Rental",
        description: "Rotating guests, unpredictable atmosphere, tourist vibes",
        image: neighborsAirbnb,
        price: 4000,
      },
      {
        id: "cats",
        name: "Cat Collector",
        description: "Dozens of felines, endless entertainment, unique aroma",
        image: neighborsCats,
        price: 3000,
      },
    ],
  },
  {
    id: "weather",
    name: "Weather",
    styles: [
      {
        id: "sunny",
        name: "Sunny",
        description: "Perfect blue skies, warm sunshine, outdoor paradise",
        image: weatherSunny,
        price: 8000,
      },
      {
        id: "cloudy",
        name: "Cloudy",
        description: "Overcast skies, diffused lighting, comfortable atmosphere",
        image: weatherCloudy,
        price: 5000,
      },
      {
        id: "rainy",
        name: "Rainy",
        description: "Gentle rainfall, cozy vibes, perfect for indoor activities",
        image: weatherRainy,
        price: 6000,
      },
      {
        id: "heatwave",
        name: "Heat Wave",
        description: "Scorching temperatures, intense sun, AC essential",
        image: weatherHeatwave,
        price: 4000,
      },
      {
        id: "arctic",
        name: "Arctic",
        description: "Heavy snow, freezing cold, winter wonderland",
        image: weatherArctic,
        price: 7000,
      },
      {
        id: "sharknado",
        name: "Sharknado",
        description: "Flying sharks, extreme chaos, insurance nightmare",
        image: weatherSharknado,
        price: 1000,
      },
    ],
  },
  {
    id: "scenery",
    name: "Scenery",
    styles: [
      {
        id: "forest",
        name: "Forest",
        description: "Lush trees, natural beauty, peaceful woodland setting",
        image: sceneryForest,
        price: 12000,
      },
      {
        id: "mountain",
        name: "Mountain",
        description: "Majestic peaks, breathtaking views, alpine paradise",
        image: sceneryMountain,
        price: 15000,
      },
      {
        id: "desert",
        name: "Desert",
        description: "Sand dunes, cacti, stunning southwestern landscape",
        image: sceneryDesert,
        price: 10000,
      },
      {
        id: "beach",
        name: "Beach",
        description: "Ocean views, sandy shores, tropical paradise",
        image: sceneryBeach,
        price: 18000,
      },
      {
        id: "countryside",
        name: "Countryside",
        description: "Rolling hills, pastoral charm, peaceful rural setting",
        image: sceneryCountryside,
        price: 11000,
      },
      {
        id: "volcano",
        name: "Active Volcano",
        description: "Lava flows, dramatic eruptions, adventure of a lifetime",
        image: sceneryVolcano,
        price: 3000,
      },
    ],
  },
];
