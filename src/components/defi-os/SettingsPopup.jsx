import React, { useState, useEffect } from 'react';
import { THEMES } from '@/config/themes';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, LogOut, AlertTriangle } from 'lucide-react';
import { getStoredSuiAddress } from '@/utils/zkLogin';
import { getStoredWallet } from '@/utils/wallet';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const SettingsPopup = ({ isOpen, onClose, theme, currentTheme, setCurrentTheme }) => {
  const [activeAction, setActiveAction] = useState(null); // 'deposit' or 'withdraw'
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('SUI');
  const [personalizedName, setPersonalizedName] = useState('Default');
  const [aiTradeEnabled, setAiTradeEnabled] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [suiAddress, setSuiAddress] = useState('');
  const { user, setUser } = useAuth();
  const [isZkLogin, setIsZkLogin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (!isOpen) return;

    // First check auth context for address
    if (user?.address) {
      console.log('Using address from auth context:', user.address);
      setSuiAddress(user.address);
      setIsZkLogin(!!user.zkLoginState); // Set ZK Login flag
      return;
    }

    // Then check ZK Login address
    const zkLoginAddress = getStoredSuiAddress();
    if (zkLoginAddress) {
      console.log('Using ZK Login address:', zkLoginAddress);
      setSuiAddress(zkLoginAddress);
      setIsZkLogin(true);
      return;
    }

    // Finally check wallet address
    const wallet = getStoredWallet();
    if (wallet?.address) {
      console.log('Using stored wallet address:', wallet.address);
      setSuiAddress(wallet.address);
      setIsZkLogin(false);
      return;
    }

    setSuiAddress('Not connected');
    setIsZkLogin(false);
  }, [isOpen, user?.address]);
  
  const currencies = ['SUI', 'USDC'];
  
  if (!isOpen) return null;

  const handleThemeChange = () => {
    const themes = Object.keys(THEMES);
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setCurrentTheme(themes[nextIndex]);
  };

  // Generate a random wallet address-like string (42 characters like an Ethereum address)
  // const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY ;
  
  const handleConfirmWithdraw = () => {
    // Handle withdraw confirmation here
    console.log('Withdrawing to:', withdrawAddress);
    setActiveAction(null);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    if (isZkLogin) {
      // Clear ZK Login state
      localStorage.removeItem('zk_login_state');
      localStorage.removeItem('sui_address');
    } else {
      // Clear wallet state
      localStorage.removeItem('wallet');
    }
    
    // Clear auth context
    setUser(null);
    
    // Reset local state
    setSuiAddress('Not connected');
    setIsZkLogin(false);

    // Close all modals
    setShowLogoutConfirm(false);
    onClose();

    // Navigate to loading page
    router.push('/');
  };

  const QRModal = () => {
    if (!showQRModal) return null;
    
    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
          onClick={() => setShowQRModal(false)}
        />
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-xl z-[301]"
          style={{ 
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.colors.effects?.glow
          }}
        >
          <div className="flex justify-end">
            <button 
              onClick={() => setShowQRModal(false)}
              className="p-2 hover:bg-white/10 rounded-tr-lg transition-colors"
            >
              <X className="w-4 h-4" style={{ color: theme.colors?.text?.secondary || theme.colors.text }} />
            </button>
          </div>
          <div className="p-8 pt-0">
            <QRCodeSVG 
              value={suiAddress}
              size={200}
              level="H"
              includeMargin={true}
              style={{
                padding: '1rem',
                backgroundColor: 'white',
                borderRadius: '0.5rem'
              }}
            />
          </div>
        </div>
      </>
    );
  };

  const LogoutConfirmModal = () => {
    if (!showLogoutConfirm) return null;

    const modalContent = isZkLogin ? {
      title: "Logout from ZK Login?",
      message: "Make sure you have saved your salt. You will need it to recover your account."
    } : {
      title: "Logout from Wallet?",
      message: "Make sure you have saved your seed phrase. You will need it to recover your wallet."
    };

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[400]"
          onClick={() => setShowLogoutConfirm(false)}
        />
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 rounded-lg shadow-xl z-[401] max-w-md w-full"
          style={{ 
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: theme.colors.effects?.glow
          }}
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">{modalContent.title}</h3>
                <p className="text-sm opacity-80">
                  {modalContent.message}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ 
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 rounded-lg text-sm bg-red-500 hover:bg-red-600 text-white"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      <div
        className="fixed bottom-16 right-4 w-[400px] rounded-lg shadow-xl z-[201] overflow-hidden"
        style={{ 
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors?.text?.primary || theme.colors.text,
          boxShadow: theme.colors.effects?.glow
        }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: theme.colors.border }}>
          <h3 className="font-medium">Settings</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" style={{ color: theme.colors?.text?.secondary || theme.colors.text }} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Sui Address with Logout */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Sui Address:</div>
            <div className="flex items-center gap-2">
              <div 
                className="w-[320px] p-2 rounded text-sm font-mono break-all"
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  border: `1px solid ${theme.colors.border}`
                }}
                title={suiAddress}
              >
                {suiAddress}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  style={{ 
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.secondary
                  }}
                >
                  <QrCode className="w-4 h-4" style={{ color: theme.colors?.text?.secondary || theme.colors.text }} />
                </button>
                {(isZkLogin || suiAddress !== 'Not connected') && (
                  <button
                    onClick={handleLogoutClick}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    style={{ 
                      border: `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.secondary
                    }}
                    title={isZkLogin ? "Logout from ZK Login" : "Logout from Wallet"}
                  >
                    <LogOut className="w-4 h-4" style={{ color: theme.colors?.text?.secondary || theme.colors.text }} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">Currency:</div>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="flex-1 p-1.5 rounded font-medium text-sm"
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          {/* Deposit/Withdraw Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveAction('deposit')}
              className="flex-1 p-2 rounded font-medium text-sm"
              style={{ 
                backgroundColor: activeAction === 'deposit' ? theme.colors.accent : theme.colors.secondary,
                color: activeAction === 'deposit' ? '#fff' : theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              Deposit
            </button>
            <button
              onClick={() => setActiveAction('withdraw')}
              className="flex-1 p-2 rounded font-medium text-sm"
              style={{ 
                backgroundColor: activeAction === 'withdraw' ? theme.colors.accent : theme.colors.secondary,
                color: activeAction === 'withdraw' ? '#fff' : theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              Withdraw
            </button>
          </div>

          {/* Action Content */}
          {activeAction === 'withdraw' && (
            <div className="space-y-4">
              <input
                type="text"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter withdrawal address"
                className="w-full p-2 rounded text-sm"
                style={{ 
                  backgroundColor: theme.colors.secondary,
                  color: theme.colors?.text?.primary || theme.colors.text,
                  border: `1px solid ${theme.colors.border}`
                }}
              />
              <button
                onClick={handleConfirmWithdraw}
                className="w-full p-2 rounded font-medium text-sm"
                style={{ 
                  backgroundColor: theme.colors.accent,
                  color: '#fff'
                }}
              >
                Confirm Withdraw
              </button>
            </div>
          )}

          {/* Personalized Name */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">Personalised Name:</div>
            <input
              type="text"
              value={personalizedName}
              onChange={(e) => setPersonalizedName(e.target.value)}
              className="flex-1 p-1.5 rounded font-medium text-sm"
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            />
          </div>

          {/* AI Trade Execution Toggle */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">AI Trade Execution:</div>
            <button
              onClick={() => setAiTradeEnabled(!aiTradeEnabled)}
              className="flex items-center gap-2 transition-colors"
              style={{ 
                color: theme.colors?.text?.primary || theme.colors.text,
              }}
            >
              <div 
                className="w-8 h-4 rounded-full relative transition-colors"
                style={{ 
                  backgroundColor: aiTradeEnabled ? theme.colors.accent : 'rgba(0,0,0,0.2)'
                }}
              >
                <div 
                  className="absolute top-0.5 w-3 h-3 rounded-full transition-transform"
                  style={{ 
                    backgroundColor: '#fff',
                    transform: `translateX(${aiTradeEnabled ? '16px' : '2px'})`
                  }}
                />
              </div>
              <span className="text-sm">{aiTradeEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Theme Selector */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">Theme:</div>
            <button
              onClick={handleThemeChange}
              className="flex items-center gap-2 p-1.5 rounded font-medium text-sm w-32 truncate"
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <span className="truncate">{theme.name}</span>
            </button>
          </div>

          {/* Download Weekly Report */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium whitespace-nowrap">Weekly Report:</div>
            <button
              onClick={() => {
                // TODO: Implement report download
                console.log('Downloading weekly report...');
              }}
              className="flex items-center gap-2 p-1.5 rounded font-medium text-sm w-32 truncate"
              style={{ 
                backgroundColor: theme.colors.secondary,
                color: theme.colors?.text?.primary || theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <span className="truncate">Download</span>
            </button>
          </div>
        </div>
      </div>

      <QRModal />
      <LogoutConfirmModal />
    </>
  );
};

export default SettingsPopup;
