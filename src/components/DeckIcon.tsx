import React from 'react';
import {
  Users,
  Smile,
  Heart,
  UserCheck,
  Activity,
  Leaf,
  Utensils,
  Apple,
  ChefHat,
  Coffee,
  Fish,
  Shirt,
  Palette,
  Sparkles,
  ShoppingBag,
  Clock,
  Hash,
  ShoppingCart,
  Sun,
  Globe,
  Dog,
  Bug,
  Flower2,
  GraduationCap,
  Briefcase,
  Building2,
  Shield,
  PenTool,
  Plane,
  Car,
  Flag,
  Home,
  Stethoscope,
  Mail,
  Landmark,
  Trophy,
  Goal,
  Film,
  Snowflake,
  Moon,
  Gift,
  BookOpen,
  type LucideProps
} from 'lucide-react';

interface DeckIconProps extends LucideProps {
  name?: string;
  category?: string;
}

export const DeckIcon: React.FC<DeckIconProps> = ({ name, category, className = "w-6 h-6 text-white", ...props }) => {
  const iconName = name?.trim();

  switch (iconName) {
    case 'Users': return <Users className={className} {...props} />;
    case 'Smile': return <Smile className={className} {...props} />;
    case 'Heart': return <Heart className={className} {...props} />;
    case 'UserCheck': return <UserCheck className={className} {...props} />;
    case 'Activity': return <Activity className={className} {...props} />;
    case 'Leaf': return <Leaf className={className} {...props} />;
    case 'Utensils': return <Utensils className={className} {...props} />;
    case 'Apple': return <Apple className={className} {...props} />;
    case 'ChefHat': return <ChefHat className={className} {...props} />;
    case 'Coffee': return <Coffee className={className} {...props} />;
    case 'Fish': return <Fish className={className} {...props} />;
    case 'Shirt': return <Shirt className={className} {...props} />;
    case 'Palette': return <Palette className={className} {...props} />;
    case 'Sparkles': return <Sparkles className={className} {...props} />;
    case 'ShoppingBag': return <ShoppingBag className={className} {...props} />;
    case 'Clock': return <Clock className={className} {...props} />;
    case 'Hash': return <Hash className={className} {...props} />;
    case 'ShoppingCart': return <ShoppingCart className={className} {...props} />;
    case 'Sun': return <Sun className={className} {...props} />;
    case 'Globe': return <Globe className={className} {...props} />;
    case 'Dog': return <Dog className={className} {...props} />;
    case 'Bug': return <Bug className={className} {...props} />;
    case 'Flower2': return <Flower2 className={className} {...props} />;
    case 'GraduationCap': return <GraduationCap className={className} {...props} />;
    case 'Briefcase': return <Briefcase className={className} {...props} />;
    case 'Building2': return <Building2 className={className} {...props} />;
    case 'Shield': return <Shield className={className} {...props} />;
    case 'PenTool': return <PenTool className={className} {...props} />;
    case 'Plane': return <Plane className={className} {...props} />;
    case 'Car': return <Car className={className} {...props} />;
    case 'Flag': return <Flag className={className} {...props} />;
    case 'Home': return <Home className={className} {...props} />;
    case 'Stethoscope': return <Stethoscope className={className} {...props} />;
    case 'Mail': return <Mail className={className} {...props} />;
    case 'Landmark': return <Landmark className={className} {...props} />;
    case 'Trophy': return <Trophy className={className} {...props} />;
    case 'Goal': return <Goal className={className} {...props} />;
    case 'Film': return <Film className={className} {...props} />;
    case 'Snowflake': return <Snowflake className={className} {...props} />;
    case 'Moon': return <Moon className={className} {...props} />;
    case 'Gift': return <Gift className={className} {...props} />;
  }

  // Fallback by Category if icon name is missing
  switch (category) {
    case 'people_feelings': return <Users className={className} {...props} />;
    case 'food_dining': return <Utensils className={className} {...props} />;
    case 'daily_shopping': return <ShoppingBag className={className} {...props} />;
    case 'nature_environment': return <Globe className={className} {...props} />;
    case 'education_career': return <GraduationCap className={className} {...props} />;
    case 'places_services': return <Plane className={className} {...props} />;
    case 'leisure_festivals': return <Trophy className={className} {...props} />;
    default: return <BookOpen className={className} {...props} />;
  }
};
