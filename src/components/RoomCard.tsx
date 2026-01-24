import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { RoomStyle } from "@/lib/roomData";

interface RoomCardProps {
  style: RoomStyle;
  inCart: boolean;
  onCartToggle: () => void;
}

const RoomCard = ({ style, inCart, onCartToggle }: RoomCardProps) => {
  return (
    <Card 
      className="group transition-all hover:shadow-lg"
    >
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
          <img
            src={style.image}
            alt={style.name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg">{style.name}</h3>
          <p className="text-sm text-muted-foreground">{style.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xl font-bold">
              ${style.price.toLocaleString()}
            </span>
            <Button 
              variant={inCart ? "default" : "outline"}
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onCartToggle();
              }}
              className="h-10 w-10"
            >
              <ShoppingCart className={`h-5 w-5 ${inCart ? "text-primary-foreground" : ""}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
