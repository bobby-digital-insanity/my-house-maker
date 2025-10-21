import kitchenModern from "@/assets/kitchen-modern.jpg";
import kitchenRustic from "@/assets/kitchen-rustic.jpg";
import kitchenIndustrial from "@/assets/kitchen-industrial.jpg";
import kitchenRetro from "@/assets/kitchen-retro.jpg";
import kitchenMinimalist from "@/assets/kitchen-minimalist.jpg";
import kitchenTraditional from "@/assets/kitchen-traditional.jpg";

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
        image: kitchenModern,
        price: 32000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Natural materials, cozy fireplace, warm textures",
        image: kitchenRustic,
        price: 28000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Raw materials, exposed elements, urban style",
        image: kitchenIndustrial,
        price: 30000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vintage furniture, bold patterns, nostalgic vibe",
        image: kitchenRetro,
        price: 26000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Essential furniture, neutral palette, spacious feel",
        image: kitchenMinimalist,
        price: 29000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic furniture, elegant details, formal layout",
        image: kitchenTraditional,
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
        image: kitchenModern,
        price: 18000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Wood finish, vintage tools display, workshop feel",
        image: kitchenRustic,
        price: 15000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Heavy-duty shelving, metal finishes, functional layout",
        image: kitchenIndustrial,
        price: 16000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Classic car theme, vintage signage, nostalgic decor",
        image: kitchenRetro,
        price: 14000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean storage, minimal clutter, efficient design",
        image: kitchenMinimalist,
        price: 15500,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic workbench, organized tools, timeless setup",
        image: kitchenTraditional,
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
        image: kitchenModern,
        price: 35000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Man cave, wood paneling, comfortable lounge",
        image: kitchenRustic,
        price: 30000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Exposed ceiling, concrete floors, urban bar setup",
        image: kitchenIndustrial,
        price: 32000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vintage arcade, nostalgic memorabilia, fun atmosphere",
        image: kitchenRetro,
        price: 28000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Multi-purpose space, clean design, flexible layout",
        image: kitchenMinimalist,
        price: 31000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Classic rec room, wood finish, family gathering space",
        image: kitchenTraditional,
        price: 36000,
      },
    ],
  },
  {
    id: "entertainment",
    name: "Entertainment Room",
    styles: [
      {
        id: "modern",
        name: "Modern",
        description: "State-of-art AV system, comfortable seating, ambient lighting",
        image: kitchenModern,
        price: 40000,
      },
      {
        id: "rustic",
        name: "Rustic",
        description: "Cozy theater, wood accents, warm atmosphere",
        image: kitchenRustic,
        price: 35000,
      },
      {
        id: "industrial",
        name: "Industrial",
        description: "Urban cinema, exposed elements, modern technology",
        image: kitchenIndustrial,
        price: 38000,
      },
      {
        id: "retro",
        name: "60's Retro",
        description: "Vintage movie palace, nostalgic decor, classic feel",
        image: kitchenRetro,
        price: 33000,
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean theater setup, focus on screen, minimal distractions",
        image: kitchenMinimalist,
        price: 36000,
      },
      {
        id: "traditional",
        name: "Traditional",
        description: "Elegant home cinema, luxurious seating, classic styling",
        image: kitchenTraditional,
        price: 42000,
      },
    ],
  },
];
