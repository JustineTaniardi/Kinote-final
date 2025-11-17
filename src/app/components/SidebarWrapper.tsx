"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface SidebarWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string; // e.g. '400px'
}

export default function SidebarWrapper({
  isOpen,
  onClose,
  children,
  width = "400px",
}: SidebarWrapperProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            onClick={(e) => e.stopPropagation()}
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.1, 0.25, 1] }}
            className="absolute top-0 right-0 h-screen bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
            style={{ width }}
          >
            {children}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
