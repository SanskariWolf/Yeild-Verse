export interface Portfolio {
    id: string;
    userId: string; // Wallet address
    riskAppetite: 'conservative' | 'moderate' | 'aggressive';
    initialInvestment: number;
    assets: Asset[];
    createdAt: Date;
    updatedAt: Date;
    // Add other portfolio properties
  }
  
  export interface Asset {
    symbol: string;
    balance: number;
    value: number; // USD value
    apy: number;   // Current APY
  }
  
  // Example data (replace with database later)
  const portfolios: Portfolio[] = [
      {
          id: 'portfolio1',
          userId: '0x1234567890123456789012345678901234567890',
          riskAppetite: 'moderate',
          initialInvestment: 1000,
          assets: [
              { symbol: 'ETH', balance: 2.5, value: 5000, apy: 0.05 },
              { symbol: 'DAI', balance: 1000, value: 1000, apy: 0.08 },
          ],
          createdAt: new Date(),
          updatedAt: new Date()
      }
  ];
    export const getPortfolioByUserId = (userId: string): Portfolio | undefined => {
      return portfolios.find(p => p.userId === userId);
    };
  
    export const createPortfolio = (portfolioData: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>): Portfolio => { //omit id since db creates it
      const newPortfolio: Portfolio = {
        id: generateUniqueId(), // You'll need a function to generate unique IDs
        ...portfolioData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      portfolios.push(newPortfolio);
      return newPortfolio;
    };
  
    export const updatePortfolio = (userId: string, updatedData: Partial<Portfolio>): Portfolio | undefined => {
      const portfolioIndex = portfolios.findIndex(p => p.userId === userId);
  
      if (portfolioIndex === -1) {
        return undefined; // Or throw an error
      }
  
      portfolios[portfolioIndex] = {
        ...portfolios[portfolioIndex],
        ...updatedData,
        updatedAt: new Date(), // Always update the updatedAt timestamp
      };
  
      return portfolios[portfolioIndex];
    };
  
    // Helper function to generate a unique ID (replace with a more robust solution)
    function generateUniqueId(): string {
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    // Add other portfolio-related functions (update, delete, etc.)
