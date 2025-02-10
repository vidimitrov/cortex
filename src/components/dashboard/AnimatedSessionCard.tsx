import { Session } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface AnimatedSessionCardProps {
  session: Session;
  onClick: () => void;
  isActive?: boolean;
}

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1], // Custom cubic bezier for smooth animation
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: "anticipate"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

export default function AnimatedSessionCard({
  session,
  onClick,
  isActive = false,
}: AnimatedSessionCardProps) {
  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover="hover"
      className={`bg-dark-card border border-dark-border rounded-lg overflow-hidden transition-colors duration-200 ${
        isActive ? "border-primary-400" : "hover:border-primary-400/50"
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div className="w-full text-left px-3 py-2 rounded-md transition-colors duration-200">
        <div className="flex items-start gap-3">
          <motion.div variants={childVariants}>
            <DocumentTextIcon
              className={`h-5 w-5 flex-shrink-0 ${
                isActive ? "text-primary-400" : "text-gray-400"
              }`}
            />
          </motion.div>
          <div className="min-w-0 flex-1">
            <motion.p 
              variants={childVariants} 
              className="text-sm font-medium truncate"
            >
              {session.title}
            </motion.p>
            <motion.p 
              variants={childVariants}
              className="text-xs truncate mt-0.5 text-gray-500"
            >
              {session.description || "No description"}
            </motion.p>
            <motion.p 
              variants={childVariants}
              className="text-xs text-gray-600 mt-1"
            >
              {new Date(session.created_at).toLocaleDateString()}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
