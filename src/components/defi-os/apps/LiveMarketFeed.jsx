import React, { useState, useEffect } from 'react';
import { TrendingUp, Coins, Loader2, ArrowUpRight, ArrowDownRight, MessageCircle, Users, Bot } from 'lucide-react';
import Image from 'next/image';

const TokenIcon = ({ theme }) => (
  <div 
    className="w-8 h-8 flex items-center justify-center rounded-full"
    style={{ 
      background: `${theme.colors.accent}20`,
      border: `1px solid ${theme.colors.border}`
    }}
  >
    <Coins className="w-5 h-5" style={{ color: theme.colors.accent }} />
  </div>
);

const formatNumber = (num) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

const formatPercentage = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};

const TokenRow = ({ token, price, change24h, volume24h, volume1h, theme }) => (
  <div 
    className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-white/5"
    style={{ borderBottom: `1px solid ${theme.colors.border}` }}
  >
    <div className="flex items-center gap-3">
      <TokenIcon theme={theme} />
      <div>
        <div className="font-medium" style={{ color: theme.colors.text?.primary }}>
          {token}
        </div>
        <div className="text-sm" style={{ color: theme.colors.text?.secondary }}>
          ${volume1h} 1h Vol • ${volume24h} 24h Vol
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="font-medium" style={{ color: theme.colors.text?.primary }}>
        ${parseFloat(price).toFixed(4)}
      </div>
      <div 
        className="text-sm flex items-center justify-end gap-1"
        style={{ color: change24h >= 0 ? '#22c55e' : '#ef4444' }}
      >
        {change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {formatPercentage(change24h)}%
      </div>
    </div>
  </div>
);

const LoadingState = ({ theme }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.colors.accent }} />
  </div>
);

const FeedToggleButton = ({ active, onClick, icon: Icon, label, theme }) => (
  <button
    onClick={(e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      onClick();
    }}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
      active ? 'opacity-100' : 'opacity-70 hover:opacity-90'
    }`}
    style={{
      background: active ? `${theme.colors.accent}20` : 'transparent',
      border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
      color: active ? theme.colors.accent : theme.colors.text?.primary
    }}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const TweetCard = ({ tweet, theme }) => {
  // Format the date to a readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="p-4 rounded-lg mb-3"
      style={{ 
        background: `${theme.colors.background}40`,
        border: `1px solid ${theme.colors.border}` 
      }}
    >
      <div className="flex items-start gap-3">
        {tweet.profile_image_url ? (
          <Image
            src={tweet.profile_image_url}
            alt={`@${tweet.username}'s profile`}
            width={40}
            height={40}
            className="rounded-full"
            style={{ border: `1px solid ${theme.colors.border}` }}
          />
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ 
              background: `${theme.colors.accent}20`,
              border: `1px solid ${theme.colors.border}`
            }}
          >
            <Users className="w-6 h-6" style={{ color: theme.colors.accent }} />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium" style={{ color: theme.colors.text?.primary }}>
              @{tweet.username}
            </span>
            <span className="text-sm" style={{ color: theme.colors.text?.secondary }}>
              • {formatDate(tweet.created_at)}
            </span>
          </div>
          <p 
            className="mt-2 text-sm whitespace-pre-wrap"
            style={{ color: theme.colors.text?.primary }}
          >
            {tweet.text}
          </p>
          <div 
            className="mt-2 text-sm flex items-center gap-4"
            style={{ color: theme.colors.text?.secondary }}
          >
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {tweet.retweets || 0}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {tweet.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getTweets = async (category) => {
  try {
    const response = await fetch('/data/tweets.json');
    const allTweets = await response.json();
    
    // Filter tweets from the last 12 hours
    const twelveHoursAgo = new Date();
    twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);
    
    console.log('Category:', category);
    console.log('Total tweets:', allTweets.length);
    console.log('All tweets:', allTweets);
    
    const filteredTweets = allTweets.filter(tweet => {
      // Parse the date correctly
      const tweetDate = new Date(tweet.created_at.replace(' ', 'T'));
      const isRecent = tweetDate >= twelveHoursAgo;
      
      // Simple category match
      const categoryMatches = tweet.category === category;
      
      if (!categoryMatches) {
        console.log(`Tweet category mismatch for ${tweet.username}:`, tweet.category, 'expected:', category);
      }
      if (!isRecent) {
        console.log('Tweet filtered out due to age:', tweet.created_at);
      }
      
      return categoryMatches && isRecent;
    });
    
    console.log(`Found ${filteredTweets.length} matching tweets for category ${category}`);
    console.log('Matching tweets:', filteredTweets);
    
    return filteredTweets
      .sort((a, b) => new Date(b.created_at.replace(' ', 'T')) - new Date(a.created_at.replace(' ', 'T')))
      .slice(0, 50);
  } catch (error) {
    console.error('Error loading tweets:', error);
    return [];
  }
};

const MitsuiChatButton = ({ theme, onClick }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    className="absolute top-4 right-8 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 overflow-hidden"
    style={{ 
      background: `${theme.colors.accent}20`,
      border: `1px solid ${theme.colors.accent}`,
    }}
  >
    <img 
      src="/assets/characters/sample_for_agent.png"
      alt="Mitsui"
      className="w-full h-full object-cover"
    />
  </button>
);

const LiveMarketFeed = ({ isExpanded, theme, onChatOpen }) => {
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('market'); // 'market', 'kol', or 'project'
  const [tweets, setTweets] = useState([]);
  const [isTweetsLoading, setIsTweetsLoading] = useState(false);

  useEffect(() => {
    const fetchTrendingTokens = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/trending');
        const data = await response.json();
        
        // Format the data and filter out ETH, WETH, and USDT
        const formattedTokens = data
          .filter(token => 
            token.coinMetadata.symbol !== 'ETH' && 
            token.coinMetadata.symbol !== 'WETH' &&
            token.coinMetadata.symbol !== 'USDT'
          )
          .map(token => ({
            token: token.coinMetadata.symbol,
            price: token.coinPrice.toString(),
            change24h: parseFloat(token.percentagePriceChange24h || 0),
            volume24h: formatNumber(parseFloat(token.volume24h)),
            volume1h: formatNumber(parseFloat(token.volume1h))
          }));

        // Sort by 1h volume
        const sortedByVolume = [...formattedTokens].sort((a, b) => 
          parseFloat(b.volume1h.replace(/[KM]/g, '')) - parseFloat(a.volume1h.replace(/[KM]/g, ''))
        );
        setTrendingTokens(sortedByVolume);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTokens();
    const interval = setInterval(fetchTrendingTokens, 1200000); // 20 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchTweets = async (category) => {
    try {
      setIsTweetsLoading(true);
      console.log('Fetching tweets for category:', category);
      const tweets = await getTweets(category);
      console.log(`Received ${tweets.length} tweets for ${category}`);
      setTweets(tweets);
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setTweets([]);
    } finally {
      setIsTweetsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'kol') {
      fetchTweets('KOLs');  
    } else if (activeView === 'project') {
      fetchTweets('Projects');
    }
  }, [activeView]);

  return (
    <div className={`h-full p-4 ${isExpanded ? 'w-[67vw]' : ''} relative`}>
      <div className="h-full flex flex-col">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {activeView === 'market' ? (
              <TrendingUp className="w-5 h-5" style={{ color: theme.colors.accent }} />
            ) : (
              <MessageCircle className="w-5 h-5" style={{ color: theme.colors.accent }} />
            )}
            <h2 className="text-lg font-medium" style={{ color: theme.colors.text?.primary }}>
              {activeView === 'market' ? 'Trending Tokens (1h Vol)' : 
               activeView === 'kol' ? 'KOL Feed' : 'Project Feed'}
            </h2>
          </div>
        </div>

        {/* Mitsui Chat Button */}
        <MitsuiChatButton 
          theme={theme} 
          onClick={() => onChatOpen?.()} 
        />

        {/* Main content area */}
        <div 
          className="rounded-xl overflow-hidden flex-1"
          style={{ 
            background: theme.colors.secondary,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.colors.effects?.glow
          }}
        >
          <div className="h-full overflow-y-auto custom-scrollbar">
            {/* Market view */}
            {activeView === 'market' && (
              isLoading ? (
                <LoadingState theme={theme} />
              ) : (
                trendingTokens.map((token, index) => (
                  <TokenRow 
                    key={index} 
                    {...token} 
                    theme={theme}
                  />
                ))
              )
            )}

            {/* Tweet views */}
            {(activeView === 'kol' || activeView === 'project') && (
              <div className="p-4">
                {isTweetsLoading ? (
                  <LoadingState theme={theme} />
                ) : tweets.length > 0 ? (
                  tweets.map((tweet, index) => (
                    <TweetCard 
                      key={index}
                      tweet={tweet}
                      theme={theme}
                    />
                  ))
                ) : (
                  <div 
                    className="text-center py-8"
                    style={{ color: theme.colors.text?.secondary }}
                  >
                    No tweets found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feed toggle buttons (only show when expanded) */}
        {isExpanded && (
          <div className="mt-4 flex justify-center gap-3">
            <FeedToggleButton
              active={activeView === 'market'}
              onClick={() => setActiveView('market')}
              icon={TrendingUp}
              label="Market Feed"
              theme={theme}
            />
            <FeedToggleButton
              active={activeView === 'kol'}
              onClick={() => setActiveView('kol')}
              icon={Users}
              label="KOL Feed"
              theme={theme}
            />
            <FeedToggleButton
              active={activeView === 'project'}
              onClick={() => setActiveView('project')}
              icon={MessageCircle}
              label="Project Feed"
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMarketFeed; 
