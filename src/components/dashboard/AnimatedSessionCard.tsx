import { Session } from "@/types";
import { motion } from "framer-motion";
import SessionListItem from "./SessionListItem";

interface AnimatedSessionCardProps {
  session: Session;
  onClick: () => void;
  isActive?: boolean;
}

export default function AnimatedSessionCard({
  session,
  onClick,
  isActive = false,
}: AnimatedSessionCardProps) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      exit={{
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.3, ease: "backIn" }
      }}
      className={`bg-dark-card border border-dark-border rounded-lg overflow-hidden transition-colors duration-200 ${
        isActive ? "border-primary-400" : "hover:border-primary-400/50"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <SessionListItem
        session={session}
        isActive={isActive}
        onClick={onClick}
      />
    </motion.div>
  );
}
