'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  onClose?: () => void;
}

export default function SuccessAnimation({ onClose }: SuccessAnimationProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onClose) {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-6"
        >
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 text-4xl font-bold text-white shadow-lg">
            UNO
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-3xl font-bold text-gray-800"
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-4 text-xl font-bold text-purple-600"
        >
          You can play now.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="mb-6 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-4xl font-black text-transparent"
        >
          NO MERCY
        </motion.p>

        <motion.div className="mb-4 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0] }}
              transition={{ delay: i * 0.1, duration: 1, repeat: Infinity }}
              className="h-3 w-3 rounded-full bg-yellow-400"
            />
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-sm text-gray-500"
        >
          Closing in a few seconds...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
