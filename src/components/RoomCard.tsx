import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { RoomStyle } from "@/lib/roomData";

interface RoomCardProps {
  style: RoomStyle;
  selected: boolean;
  onSelect: () => void;
}

const RoomCard = ({ style, selected, onSelect }: RoomCardProps) => {
  return (
    <Card 
      className={`group cursor-pointer transition-all hover:shadow-lg ${
        selected ? "ring-2 ring-accent shadow-lg" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img
            src={style.image}
            alt={style.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
          {selected && (
            <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <Check className="h-5 w-5 text-accent-foreground" />
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">{style.name}</h3>
          <p className="text-sm text-muted-foreground">{style.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold">
              ${style.price.toLocaleString()}
            </span>
            <Button 
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {selected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
