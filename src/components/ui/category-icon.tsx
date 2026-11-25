import React from "react";
import {
  Utensils,
  Coffee,
  Pizza,
  Bus,
  Car,
  Train,
  Plane,
  Bike,
  ShoppingBag,
  Shirt,
  Receipt,
  Smartphone,
  HeartPulse,
  Stethoscope,
  Clapperboard,
  Briefcase,
  Laptop,
  Gift,
  CircleDollarSign,
  CircleEllipsis,
  Coins,
  Fuel,
  Film,
  Music,
  Gamepad2,
  Dumbbell,
  Book,
  GraduationCap,
  Wifi,
  Zap,
  Droplets,
  Home,
  Wallet,
  PiggyBank,
  Landmark,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Award,
  Wrench,
  PawPrint,
  Baby,
  Sparkles,
  Tag,
  type LucideProps,
} from "lucide-react";
import { getCategories } from "@/lib/storage";
import { isIconUrl, isLucideIconName } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Utensils,
  Coffee,
  Pizza,
  Bus,
  Car,
  Train,
  Plane,
  Bike,
  ShoppingBag,
  Shirt,
  Receipt,
  Smartphone,
  HeartPulse,
  Stethoscope,
  Clapperboard,
  Briefcase,
  Laptop,
  Gift,
  CircleDollarSign,
  CircleEllipsis,
  Coins,
  Fuel,
  Film,
  Music,
  Gamepad2,
  Dumbbell,
  Book,
  GraduationCap,
  Wifi,
  Zap,
  Droplets,
  Home,
  Wallet,
  PiggyBank,
  Landmark,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Award,
  Wrench,
  PawPrint,
  Baby,
  Sparkles,
  Tag,
};

interface CategoryIconProps extends LucideProps {
  name?: string;
  category?: string;
}

export function CategoryIcon({ name, category, className, ...props }: CategoryIconProps) {
  let resolvedName = name?.trim();

  if (!resolvedName && category) {
    try {
      const cats = getCategories();
      const matchedCat = cats.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      );
      if (matchedCat?.icon) {
        resolvedName = matchedCat.icon.trim();
      }
    } catch {
      // ignore
    }
  }

  // 1. Direct Icon URL
  if (resolvedName && isIconUrl(resolvedName)) {
    return (
      <img
        src={resolvedName}
        alt={category || "icon"}
        className={cn("object-contain rounded-sm shrink-0", className)}
      />
    );
  }

  // 2. Built-in Lucide icon
  let IconComponent = resolvedName ? ICON_MAP[resolvedName] : undefined;

  // 3. Emoji (any non-empty string that is not a URL and not a known Lucide icon name)
  if (!IconComponent && resolvedName && !isLucideIconName(resolvedName)) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center leading-none select-none shrink-0 text-[1em]",
          className
        )}
        aria-hidden="true"
      >
        {resolvedName}
      </span>
    );
  }

  // 4. Fallback heuristic by category name
  if (!IconComponent && category) {
    const matched = category.toLowerCase();
    if (matched.includes("food") || matched.includes("chai") || matched.includes("snack") || matched.includes("lunch") || matched.includes("dinner")) {
      IconComponent = Utensils;
    } else if (matched.includes("travel") || matched.includes("bus") || matched.includes("auto") || matched.includes("cab") || matched.includes("petrol") || matched.includes("fuel")) {
      IconComponent = Bus;
    } else if (matched.includes("shopping") || matched.includes("grocery") || matched.includes("cloth")) {
      IconComponent = ShoppingBag;
    } else if (matched.includes("bill") || matched.includes("rent") || matched.includes("elect")) {
      IconComponent = Receipt;
    } else if (matched.includes("recharge") || matched.includes("mobile") || matched.includes("phone")) {
      IconComponent = Smartphone;
    } else if (matched.includes("health") || matched.includes("med") || matched.includes("doctor")) {
      IconComponent = HeartPulse;
    } else if (matched.includes("movie") || matched.includes("entertain")) {
      IconComponent = Clapperboard;
    } else if (matched.includes("salary") || matched.includes("job")) {
      IconComponent = Briefcase;
    } else if (matched.includes("freelance") || matched.includes("client")) {
      IconComponent = Laptop;
    } else if (matched.includes("gift")) {
      IconComponent = Gift;
    }
  }

  if (!IconComponent) {
    IconComponent = CircleDollarSign;
  }

  return <IconComponent className={className} {...props} />;
}
