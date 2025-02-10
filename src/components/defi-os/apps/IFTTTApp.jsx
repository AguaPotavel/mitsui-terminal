'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Wallet, Clock, Bell, Twitter, Rss, Waves, BarChart2, PiggyBank, Coins } from 'lucide-react';
import TokenTriggers from './triggers/TokenTriggers';
import ActionBuilder from './actions/ActionBuilder';
import ServiceSelectView from './sections/ServiceSelectView';
import ClassicView from './sections/ClassicView';
import { createFlow, getFlows, updateFlow, deleteFlow } from '@/utils/api/flows';
import TabMenu from './common/TabMenu';

// Static data moved outside component
const SERVICES = [
  { id: 'token', icon: Coins, name: 'Token', color: '#FF6B6B' },
  { id: 'wallet', icon: Wallet, name: 'Wallet', color: '#4ECDC4' },
  { id: 'date', icon: Clock, name: 'Date & Time', color: '#45B7D1' },
  { id: 'event', icon: Bell, name: 'Event', color: '#96CEB4' },
  { id: 'twitter', icon: Twitter, name: 'Twitter', color: '#1DA1F2' },
  { id: 'rss', icon: Rss, name: 'RSS Feed', color: '#FFA500' },
  { id: 'cetus', icon: Waves, name: 'Cetus', color: '#6C5CE7' },
  { id: 'bluefin', icon: BarChart2, name: 'Bluefin', color: '#0984E3' },
  { id: 'suilend', icon: PiggyBank, name: 'Suilend', color: '#00B894' },
];

const IFTTTApp = React.memo(({ isExpanded, theme }) => {
  // State
  const [activeTab, setActiveTab] = useState('classic');
  const [showServiceSelect, setShowServiceSelect] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [configuredTrigger, setConfiguredTrigger] = useState(null);
  const [configuredAction, setConfiguredAction] = useState(null);
  const [showActionBuilder, setShowActionBuilder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [flows, setFlows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized handlers
  const getServiceColors = useCallback((baseColor) => {
    if (theme.name?.toLowerCase().includes('dark') || theme.name?.toLowerCase() === 'matrix') {
      return {
        background: `${baseColor}CC`,
        text: '#000000',
        hover: baseColor
      };
    }
    return {
      background: baseColor,
      text: '#FFFFFF',
      hover: `${baseColor}E6`
    };
  }, [theme.name]);

  const handleBack = useCallback(() => {
    if (selectedService) {
      if (showActionBuilder) {
        setShowActionBuilder(false);
        return;
      }
      setSelectedService(null);
      return;
    }
    setShowServiceSelect(false);
  }, [selectedService, showActionBuilder]);

  const handleTriggerSave = useCallback((trigger, config) => {
    setConfiguredTrigger({
      ...trigger,
      config,
      service: selectedService
    });
    setSelectedService(null);
    setShowServiceSelect(false);
  }, [selectedService]);

  const handleActionSave = useCallback((action, config) => {
    if (!selectedService) return;

    setConfiguredAction({
      ...action,
      config,
      service: selectedService
    });
    setSelectedService(null);
    setShowActionBuilder(false);
  }, [selectedService]);

  const handleCreateFlow = useCallback(async () => {
    if (!configuredTrigger || !configuredAction) return;

    try {
      setIsSaving(true);
      const newFlow = {
        name: `${configuredTrigger.title} → ${configuredAction.title}`,
        trigger: {
          service: configuredTrigger.service,
          action: {
            id: configuredTrigger.id,
            title: configuredTrigger.title,
            config: configuredTrigger.config
          }
        },
        action: {
          service: configuredAction.service,
          action: {
            id: configuredAction.id,
            title: configuredAction.title,
            config: configuredAction.config
          }
        }
      };

      const { flow } = await createFlow(newFlow);
      setFlows(prevFlows => [...prevFlows, flow]);
      setConfiguredTrigger(null);
      setConfiguredAction(null);
    } catch (error) {
      console.error('Failed to create flow:', error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  }, [configuredTrigger, configuredAction]);

  // Add new handlers
  const handleTriggerServiceSelect = useCallback((service) => {
    setSelectedService(service);
    setShowServiceSelect(false);  // Hide service select
  }, []);

  const handleActionServiceSelect = useCallback((service) => {
    setSelectedService(service);
    setShowActionBuilder(true);  // Show action builder
    setShowServiceSelect(false);
  }, []);

  // Fetch flows on mount
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setIsLoading(true);
        const { flows } = await getFlows();
        setFlows(flows);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlows();
  }, []);

  // Get accent text color
  const getAccentTextColor = useCallback(() => {
    if (theme.name?.toLowerCase() === 'matrix') {
      return '#000000';
    }
    return theme.colors.text?.onAccent || theme.colors.text?.primary || '#FFFFFF';
  }, [theme]);

  // Render methods
  const renderTriggerView = () => (
    <TokenTriggers 
      theme={theme}
      onBack={handleBack}
      isExpanded={isExpanded}
      onSaveTrigger={handleTriggerSave}
    />
  );

  const renderActionView = () => (
    <ActionBuilder
      theme={theme}
      onBack={handleBack}
      isExpanded={isExpanded}
      onSaveAction={handleActionSave}
      selectedService={selectedService}
    />
  );

  // Add back AI view
  const renderAIView = () => (
    <div className="flex flex-col p-8 space-y-6">
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: theme.colors.secondary }}
      >
        <textarea
          placeholder="Describe what you want to automate in plain English..."
          className="w-full h-32 bg-transparent resize-none focus:outline-none"
          style={{ color: theme.colors.text.primary }}
        />
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ 
              backgroundColor: theme.colors.accent,
              color: getAccentTextColor()
            }}
          >
            <Zap className="w-4 h-4" />
            Generate Flow
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="h-full flex flex-col">
      {selectedService ? (
        showActionBuilder ? renderActionView() : renderTriggerView()
      ) : showServiceSelect ? (
        <ServiceSelectView
          mode={configuredTrigger ? 'action' : 'trigger'}
          services={SERVICES}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBack={handleBack}
          onSelect={configuredTrigger ? handleActionServiceSelect : handleTriggerServiceSelect}
          getServiceColors={getServiceColors}
          theme={theme}
        />
      ) : (
        <>
          <TabMenu 
            activeTab={activeTab}
            onTabChange={setActiveTab}
            theme={theme}
            getAccentTextColor={getAccentTextColor}
          />
          <div className="flex-1 overflow-hidden">
            {activeTab === 'classic' ? (
              <ClassicView
                configuredTrigger={configuredTrigger}
                configuredAction={configuredAction}
                onTriggerSelect={() => setShowServiceSelect(true)}
                onTriggerEdit={() => {
                  setSelectedService(configuredTrigger.service);
                  setShowServiceSelect(false);
                }}
                onTriggerDelete={() => {
                  setConfiguredTrigger(null);
                  setConfiguredAction(null);
                }}
                onActionSelect={() => {
                  if (configuredTrigger) {
                    setSelectedService({ id: 'wallet', icon: Wallet, name: 'Wallet', color: '#4ECDC4' });
                    setShowActionBuilder(true);
                  }
                }}
                onActionEdit={() => {
                  if (configuredAction?.service) {
                    setSelectedService(configuredAction.service);
                    setShowActionBuilder(true);
                  }
                }}
                onActionDelete={() => setConfiguredAction(null)}
                onCreateFlow={handleCreateFlow}
                isSaving={isSaving}
                theme={theme}
                getAccentTextColor={getAccentTextColor}
              />
            ) : (
              renderAIView()
            )}
          </div>
        </>
      )}
    </div>
  );
});

IFTTTApp.displayName = 'IFTTTApp';

export default IFTTTApp; 