// src/services/ai.service.ts

// STUB: Replace with actual calls to the Python FastAPI service
export const getAIPredictions = async (userId: string): Promise<any> => {
    return {
      recommendedAllocations: [
        { symbol: 'ETH', percentage: 0.6 },
        { symbol: 'DAI', percentage: 0.4 },
      ],
      projectedYield: 0.07,
    };
  };