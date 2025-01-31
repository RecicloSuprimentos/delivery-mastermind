import { useState } from "react";
import type { Service } from "@/types/routes";

export const useRouteFormState = () => {
  const [shouldOptimize, setShouldOptimize] = useState(false);

  const handleOptimize = (onOptimize: () => void) => {
    setShouldOptimize(true);
    onOptimize();
  };

  const resetOptimization = () => {
    setShouldOptimize(false);
  };

  return {
    shouldOptimize,
    handleOptimize,
    resetOptimization,
  };
};