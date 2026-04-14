import { 
  Sparkles, 
  Leaf, 
  Droplets, 
  Sun, 
  Moon, 
  Star, 
  Heart, 
  Shield, 
  Coffee, 
  Flame, 
  Flower, 
  Flower2, 
  Wind, 
  FlaskConical, 
  Gift, 
  Clock, 
  CheckCircle2,
  Brush,
  Zap,
  Waves,
  Eye,
  Smile,
  Search,
  Check,
  SprayCan,
  Gem,
  Crown,
  Package,
  Tag,
  ShoppingBag,
  ShoppingCart,
  Cloud,
  Thermometer,
  Scissors,
  FlaskRound,
  Pill,
  Syringe,
  Microscope,
  Baby,
  Footprints,
  Fingerprint,
  Dna,
  Apple,
  Shell,
  Nut,
  GlassWater,
  Coins,
  Medal,
  Award,
  Umbrella,
  Plane,
  Camera,
  Music,
  HeartPulse,
  Activity,
  Trees,
  Sprout,
  Wand2,
  Sparkle,
  Tent,
  Mountain,
  Palmtree,
  Anchor,
  Compass,
  Map,
  ShoppingBasket
} from "lucide-react";
import { useState } from "react";
import * as Icons from "lucide-react";

const BEAUTY_ICONS = [
  { name: "Sparkles", Icon: Sparkles },
  { name: "Sparkle", Icon: Sparkle },
  { name: "Wand2", Icon: Wand2 },
  { name: "Leaf", Icon: Leaf },
  { name: "Droplets", Icon: Droplets },
  { name: "Sun", Icon: Sun },
  { name: "Moon", Icon: Moon },
  { name: "Star", Icon: Star },
  { name: "Heart", Icon: Heart },
  { name: "Shield", Icon: Shield },
  { name: "Coffee", Icon: Coffee },
  { name: "Flame", Icon: Flame },
  { name: "Flower", Icon: Flower },
  { name: "Flower2", Icon: Flower2 },
  { name: "Sprout", Icon: Sprout },
  { name: "Trees", Icon: Trees },
  { name: "Wind", Icon: Wind },
  { name: "FlaskConical", Icon: FlaskConical },
  { name: "FlaskRound", Icon: FlaskRound },
  { name: "Microscope", Icon: Microscope },
  { name: "Gift", Icon: Gift },
  { name: "Clock", Icon: Clock },
  { name: "CheckCircle2", Icon: CheckCircle2 },
  { name: "Brush", Icon: Brush },
  { name: "Zap", Icon: Zap },
  { name: "Waves", Icon: Waves },
  { name: "Eye", Icon: Eye },
  { name: "Smile", Icon: Smile },
  { name: "SprayCan", Icon: SprayCan },
  { name: "Gem", Icon: Gem },
  { name: "Crown", Icon: Crown },
  { name: "Package", Icon: Package },
  { name: "Tag", Icon: Tag },
  { name: "ShoppingBag", Icon: ShoppingBag },
  { name: "ShoppingCart", Icon: ShoppingCart },
  { name: "ShoppingBasket", Icon: ShoppingBasket },
  { name: "Cloud", Icon: Cloud },
  { name: "Thermometer", Icon: Thermometer },
  { name: "Scissors", Icon: Scissors },
  { name: "Pill", Icon: Pill },
  { name: "Syringe", Icon: Syringe },
  { name: "Baby", Icon: Baby },
  { name: "Footprints", Icon: Footprints },
  { name: "Fingerprint", Icon: Fingerprint },
  { name: "Dna", Icon: Dna },
  { name: "Apple", Icon: Apple },
  { name: "Shell", Icon: Shell },
  { name: "Nut", Icon: Nut },
  { name: "GlassWater", Icon: GlassWater },
  { name: "Coins", Icon: Coins },
  { name: "Medal", Icon: Medal },
  { name: "Award", Icon: Award },
  { name: "Umbrella", Icon: Umbrella },
  { name: "Plane", Icon: Plane },
  { name: "Camera", Icon: Camera },
  { name: "Music", Icon: Music },
  { name: "HeartPulse", Icon: HeartPulse },
  { name: "Activity", Icon: Activity },
  { name: "Tent", Icon: Tent },
  { name: "Mountain", Icon: Mountain },
  { name: "Palmtree", Icon: Palmtree },
  { name: "Anchor", Icon: Anchor },
  { name: "Compass", Icon: Compass },
  { name: "Map", Icon: Map },
];

interface IconPickerProps {
  selectedIcon: string;
  onChange: (iconName: string) => void;
}

export const IconPicker = ({ selectedIcon, onChange }: IconPickerProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIcons = BEAUTY_ICONS.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <input
          type="text"
          placeholder="Search icons..."
          className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs outline-none focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredIcons.map(({ name, Icon }) => (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all hover:bg-muted ${
              selectedIcon === name 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-transparent text-muted-foreground"
            }`}
            title={name}
          >
            <Icon size={18} />
          </button>
        ))}
      </div>
      
      {selectedIcon && (
        <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Selected:</p>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {(() => {
              const SelectedIcon = (Icons as any)[selectedIcon];
              return SelectedIcon ? <SelectedIcon size={12} /> : null;
            })()}
            <span className="text-[10px] font-medium">{selectedIcon}</span>
          </div>
        </div>
      )}
    </div>
  );
};
