import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}

const ActionButton = ({ icon: Icon, label, onClick, variant = "secondary", className }: ActionButtonProps) => {
  return (
    <Button
      variant={variant === "primary" ? "default" : "outline"}
      onClick={onClick}
      className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 ${
        variant === "primary"
          ? "bg-gradient-primary text-white shadow-neon hover:shadow-float"
          : "hover:bg-accent hover:text-accent-foreground"
      } ${className}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

export default ActionButton;