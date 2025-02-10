import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';

const PortfolioApp = ({ isExpanded, theme }) => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Debug log for environment variables
        console.log('Public Key:', process.env.NEXT_PUBLIC_PUBLIC_KEY);
        console.log('API URL:', 'https://api.blockvision.org/v2/sui/account/coins');
        
        const options = {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-api-key': process.env.NEXT_PUBLIC_BLOCKVISION_API_KEY
          }
        };

        // Debug log for request options
        console.log('Request Options:', {
          url: 'https://api.blockvision.org/v2/sui/account/coins?account=' + process.env.NEXT_PUBLIC_PUBLIC_KEY,
          headers: options.headers
        });

        const response = await fetch(
          'https://api.blockvision.org/v2/sui/account/coins?account=' + process.env.NEXT_PUBLIC_PUBLIC_KEY,
          options
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not ok:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Failed to fetch portfolio: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data.result?.coins) throw new Error('No portfolio data found');

        // Transform API response and calculate totals
        let total = parseFloat(data.result.usdValue) || 0;
        let weightedChange = 0;
        let totalForChange = 0;

        // Filter and format coins
        const allCoins = data.result.coins
          .filter(coin => parseFloat(coin.usdValue) >= 1) // Filter out coins worth less than $1
          .map(coin => {
            const value = parseFloat(coin.usdValue) || 0;
            const percentage = (value / total) * 100;
            const priceChange = parseFloat(coin.priceChangePercentage24H) || 0;
            
            // Add to weighted change calculation
            if (!isNaN(priceChange)) {
              weightedChange += priceChange * value;
              totalForChange += value;
            }

            return {
              name: coin.symbol || 'Unknown',
              value: value,
              color: getRandomColor(coin.symbol),
              price: coin.price ? parseFloat(coin.price).toFixed(4) : '0.00',
              change: priceChange.toFixed(2),
              percentage: percentage.toFixed(1)
            };
          })
          .sort((a, b) => b.value - a.value);

        // Calculate final weighted average change
        const finalWeightedChange = totalForChange > 0 ? weightedChange / totalForChange : 0;

        // Separate coins into main holdings and others (less than 1%)
        const mainHoldings = allCoins.filter(coin => parseFloat(coin.percentage) >= 1);
        const smallHoldings = allCoins.filter(coin => parseFloat(coin.percentage) < 1);

        // Create Others category if there are small holdings
        const formattedData = mainHoldings;
        if (smallHoldings.length > 0) {
          const othersValue = smallHoldings.reduce((sum, coin) => sum + coin.value, 0);
          const othersPercentage = (othersValue / total) * 100;
          formattedData.push({
            name: 'Others',
            value: othersValue,
            color: '#808080', // Grey color for Others
            price: '-',
            change: '-',
            percentage: othersPercentage.toFixed(1),
            isOthers: true,
            tokens: smallHoldings // Store the individual tokens
          });
        }

        setTotalValue(total);
        setTotalChange(finalWeightedChange);
        setPortfolioData(formattedData);
      } catch (err) {
        console.error('Portfolio fetch error:', err);
        setError('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPortfolio, 300000);
    return () => clearInterval(interval);
  }, []);

  // Generate consistent colors based on token symbol
  const getRandomColor = (symbol) => {
    const colors = {
      'SUI': '#3b82f6',
      'DEEP': '#10b981',
      'BLUE': '#6366f1'
    };
    return colors[symbol] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.colors.accent }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 mb-2">{error}</div>
        <div className="text-sm" style={{ color: theme.colors?.text?.secondary }}>
          Public Key: {process.env.NEXT_PUBLIC_PUBLIC_KEY}
        </div>
      </div>
    );
  }

  if (!portfolioData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div style={{ color: theme.colors?.text?.secondary }}>No tokens found in portfolio</div>
        <div className="text-sm mt-2" style={{ color: theme.colors?.text?.secondary }}>
          Public Key: {process.env.NEXT_PUBLIC_PUBLIC_KEY}
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full overflow-hidden ${isExpanded ? 'w-[67vw]' : ''}`}>
      <div className="h-full overflow-y-auto scrollbar-hide">
        <div className="p-6 space-y-8">
          {/* Total Value Section */}
          <div className={`${isExpanded ? 'grid grid-cols-2 gap-6' : 'space-y-6'}`}>
            <div>
              <h2 style={{ color: theme.colors?.text?.secondary || theme.colors.text }} className="font-medium">
                Total Value
              </h2>
              <div style={{ color: theme.colors?.text?.primary || theme.colors.text }} className="text-3xl font-bold">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <h2 style={{ color: theme.colors?.text?.secondary || theme.colors.text }} className="font-medium">
                24h Change
              </h2>
              <div className={`text-3xl font-bold ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && portfolioData.length > 0 && (
            <>
              {/* Pie Chart */}
              <div className="h-64 mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      labelLine={false}
                    >
                      {portfolioData.map((coin, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={coin.color}
                          stroke={theme.colors.background}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend 
                      formatter={(value, entry) => {
                        const coin = portfolioData.find(d => d.name === value);
                        return (
                          <span style={{ color: theme.colors?.text?.primary || theme.colors.text }}>
                            {value} - ${coin?.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({coin?.percentage}%)
                          </span>
                        );
                      }}
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Token List */}
              <div className="space-y-4 mt-8">
                {portfolioData.map((coin, index) => (
                  <React.Fragment key={index}>
                    <div 
                      className="flex justify-between items-center p-4 rounded-lg" 
                      style={{ 
                        background: theme.colors.secondary,
                        border: `1px solid ${theme.colors.border}`,
                        borderLeft: `4px solid ${coin.color}`
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: coin.color }}></div>
                          <div style={{ color: theme.colors?.text?.primary || theme.colors.text }} className="font-medium">
                            {coin.name}
                          </div>
                          <div style={{ color: theme.colors?.text?.secondary }} className="text-sm">
                            {coin.percentage}%
                          </div>
                        </div>
                        <div style={{ color: theme.colors?.text?.secondary || theme.colors.text }} className="text-sm">
                          {coin.price !== '-' ? `$${coin.price}` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ color: theme.colors?.text?.primary || theme.colors.text }}>
                          ${coin.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {coin.change !== '-' && (
                          <div className={`text-sm ${parseFloat(coin.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {parseFloat(coin.change) >= 0 ? '+' : ''}{coin.change}%
                          </div>
                        )}
                      </div>
                    </div>
                    {coin.isOthers && coin.tokens && (
                      <div className="ml-4 space-y-2">
                        {coin.tokens.map((token, tokenIndex) => (
                          <div 
                            key={tokenIndex}
                            className="flex justify-between items-center p-3 rounded-lg" 
                            style={{ 
                              background: theme.colors.secondary,
                              border: `1px solid ${theme.colors.border}`,
                              opacity: 0.8
                            }}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <div style={{ color: theme.colors?.text?.primary || theme.colors.text }} className="text-sm">
                                  {token.name}
                                </div>
                                <div style={{ color: theme.colors?.text?.secondary }} className="text-xs">
                                  {token.percentage}%
                                </div>
                              </div>
                              <div style={{ color: theme.colors?.text?.secondary || theme.colors.text }} className="text-xs">
                                ${token.price}
                              </div>
                            </div>
                            <div className="text-right">
                              <div style={{ color: theme.colors?.text?.primary || theme.colors.text }} className="text-sm">
                                ${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                              <div className={`text-xs ${parseFloat(token.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {parseFloat(token.change) >= 0 ? '+' : ''}{token.change}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioApp;