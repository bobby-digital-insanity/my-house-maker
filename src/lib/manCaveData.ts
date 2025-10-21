import bruins from "@/assets/mancave-bruins.jpg";
import sabres from "@/assets/mancave-sabres.jpg";
import redWings from "@/assets/mancave-red-wings.jpg";
import panthers from "@/assets/mancave-panthers.jpg";
import canadiens from "@/assets/mancave-canadiens.jpg";
import senators from "@/assets/mancave-senators.jpg";
import lightning from "@/assets/mancave-lightning.jpg";
import mapleLeafs from "@/assets/mancave-maple-leafs.jpg";
import hurricanes from "@/assets/mancave-hurricanes.jpg";
import blueJackets from "@/assets/mancave-blue-jackets.jpg";
import devils from "@/assets/mancave-devils.jpg";
import islanders from "@/assets/mancave-islanders.jpg";
import rangers from "@/assets/mancave-rangers.jpg";
import flyers from "@/assets/mancave-flyers.jpg";
import penguins from "@/assets/mancave-penguins.jpg";
import capitals from "@/assets/mancave-capitals.jpg";
import coyotes from "@/assets/mancave-coyotes.jpg";
import blackhawks from "@/assets/mancave-blackhawks.jpg";
import avalanche from "@/assets/mancave-avalanche.jpg";
import stars from "@/assets/mancave-stars.jpg";
import wild from "@/assets/mancave-wild.jpg";
import predators from "@/assets/mancave-predators.jpg";
import blues from "@/assets/mancave-blues.jpg";
import jets from "@/assets/mancave-jets.jpg";
import ducks from "@/assets/mancave-ducks.jpg";
import flames from "@/assets/mancave-flames.jpg";
import oilers from "@/assets/mancave-oilers.jpg";
import kings from "@/assets/mancave-kings.jpg";
import sharks from "@/assets/mancave-sharks.jpg";
import kraken from "@/assets/mancave-kraken.jpg";
import canucks from "@/assets/mancave-canucks.jpg";
import goldenKnights from "@/assets/mancave-golden-knights.jpg";

export interface ManCaveTeam {
  id: string;
  name: string;
  fullName: string;
  image: string;
}

export const manCaveTeams: Record<string, ManCaveTeam> = {
  bruins: {
    id: "bruins",
    name: "Bruins",
    fullName: "Boston Bruins",
    image: bruins,
  },
  sabres: {
    id: "sabres",
    name: "Sabres",
    fullName: "Buffalo Sabres",
    image: sabres,
  },
  "red-wings": {
    id: "red-wings",
    name: "Red Wings",
    fullName: "Detroit Red Wings",
    image: redWings,
  },
  panthers: {
    id: "panthers",
    name: "Panthers",
    fullName: "Florida Panthers",
    image: panthers,
  },
  canadiens: {
    id: "canadiens",
    name: "Canadiens",
    fullName: "Montreal Canadiens",
    image: canadiens,
  },
  senators: {
    id: "senators",
    name: "Senators",
    fullName: "Ottawa Senators",
    image: senators,
  },
  lightning: {
    id: "lightning",
    name: "Lightning",
    fullName: "Tampa Bay Lightning",
    image: lightning,
  },
  "maple-leafs": {
    id: "maple-leafs",
    name: "Maple Leafs",
    fullName: "Toronto Maple Leafs",
    image: mapleLeafs,
  },
  hurricanes: {
    id: "hurricanes",
    name: "Hurricanes",
    fullName: "Carolina Hurricanes",
    image: hurricanes,
  },
  "blue-jackets": {
    id: "blue-jackets",
    name: "Blue Jackets",
    fullName: "Columbus Blue Jackets",
    image: blueJackets,
  },
  devils: {
    id: "devils",
    name: "Devils",
    fullName: "New Jersey Devils",
    image: devils,
  },
  islanders: {
    id: "islanders",
    name: "Islanders",
    fullName: "New York Islanders",
    image: islanders,
  },
  rangers: {
    id: "rangers",
    name: "Rangers",
    fullName: "New York Rangers",
    image: rangers,
  },
  flyers: {
    id: "flyers",
    name: "Flyers",
    fullName: "Philadelphia Flyers",
    image: flyers,
  },
  penguins: {
    id: "penguins",
    name: "Penguins",
    fullName: "Pittsburgh Penguins",
    image: penguins,
  },
  capitals: {
    id: "capitals",
    name: "Capitals",
    fullName: "Washington Capitals",
    image: capitals,
  },
  coyotes: {
    id: "coyotes",
    name: "Coyotes",
    fullName: "Arizona Coyotes",
    image: coyotes,
  },
  blackhawks: {
    id: "blackhawks",
    name: "Blackhawks",
    fullName: "Chicago Blackhawks",
    image: blackhawks,
  },
  avalanche: {
    id: "avalanche",
    name: "Avalanche",
    fullName: "Colorado Avalanche",
    image: avalanche,
  },
  stars: {
    id: "stars",
    name: "Stars",
    fullName: "Dallas Stars",
    image: stars,
  },
  wild: {
    id: "wild",
    name: "Wild",
    fullName: "Minnesota Wild",
    image: wild,
  },
  predators: {
    id: "predators",
    name: "Predators",
    fullName: "Nashville Predators",
    image: predators,
  },
  blues: {
    id: "blues",
    name: "Blues",
    fullName: "St. Louis Blues",
    image: blues,
  },
  jets: {
    id: "jets",
    name: "Jets",
    fullName: "Winnipeg Jets",
    image: jets,
  },
  ducks: {
    id: "ducks",
    name: "Ducks",
    fullName: "Anaheim Ducks",
    image: ducks,
  },
  flames: {
    id: "flames",
    name: "Flames",
    fullName: "Calgary Flames",
    image: flames,
  },
  oilers: {
    id: "oilers",
    name: "Oilers",
    fullName: "Edmonton Oilers",
    image: oilers,
  },
  kings: {
    id: "kings",
    name: "Kings",
    fullName: "Los Angeles Kings",
    image: kings,
  },
  sharks: {
    id: "sharks",
    name: "Sharks",
    fullName: "San Jose Sharks",
    image: sharks,
  },
  kraken: {
    id: "kraken",
    name: "Kraken",
    fullName: "Seattle Kraken",
    image: kraken,
  },
  canucks: {
    id: "canucks",
    name: "Canucks",
    fullName: "Vancouver Canucks",
    image: canucks,
  },
  "golden-knights": {
    id: "golden-knights",
    name: "Golden Knights",
    fullName: "Vegas Golden Knights",
    image: goldenKnights,
  },
};
