import { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { usePricing } from './PricingContext';
import LocationPermissionDialog from '../components/LocationPermissionDialog';
import {
  detectLocation,
  requestBrowserPosition,
  resolveByCoords,
  getPermissionState,
  isGeolocationSupported,
  GEO_ERROR,
} from '../utils/geoLocation';

/**
 * Owns the post-login location prompt and renders the fallback dialog once,
 * at app root, so it survives the redirect that follows login.
 *
 * Documented flow:
 *   auth success -> browser permission prompt -> country + currency resolved
 *                -> every price converted from base INR   (granted)
 *                -> retry / manual country dialog          (denied or failed)
 *
 * Conversion happens through PricingContext state, so the whole site updates in
 * place: no page refresh and no second login.
 */

const LocationPromptContext = createContext({
  promptForLocation: async () => ({ applied: false, reason: null }),
  isDialogOpen: false,
});

export const useLocationPrompt = () => useContext(LocationPromptContext);

export const LocationPromptProvider = ({ children }) => {
  const { applyLocation, changeCountry, country, currency } = usePricing();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(null);
  const [busy, setBusy] = useState(false);
  // Guards against a duplicate prompt if a caller fires twice.
  const running = useRef(false);

  /**
   * Ask for location, then apply whatever could be resolved.
   * Never throws and never blocks navigation. Worst case the user keeps the
   * current currency and the dialog explains the options.
   *
   * @returns {Promise<{applied: boolean, reason: string|null}>}
   */
  const promptForLocation = useCallback(async () => {
    if (running.current) return { applied: false, reason: null };
    running.current = true;
    setBusy(true);

    try {
      // If permission was already refused, skip a prompt the browser would
      // silently swallow and go straight to IP fallback plus the dialog.
      const permission = await getPermissionState();
      const useBrowserLocation = isGeolocationSupported() && permission !== 'denied';

      const { location, reason: failure } = await detectLocation({ useBrowserLocation });

      if (location) await applyLocation(location);

      const effectiveReason =
        failure || (permission === 'denied' ? GEO_ERROR.PERMISSION_DENIED : null);

      if (effectiveReason) {
        setReason(effectiveReason);
        setOpen(true);
      }

      return { applied: Boolean(location), reason: effectiveReason };
    } catch {
      setReason(GEO_ERROR.UNKNOWN);
      setOpen(true);
      return { applied: false, reason: GEO_ERROR.UNKNOWN };
    } finally {
      setBusy(false);
      running.current = false;
    }
  }, [applyLocation]);

  /** Re-trigger the native permission prompt from the dialog. */
  const handleRetry = useCallback(async () => {
    setBusy(true);
    try {
      const { latitude, longitude } = await requestBrowserPosition();
      await applyLocation(await resolveByCoords(latitude, longitude));
      setOpen(false);
      setReason(null);
      return true;
    } catch (error) {
      // Still refused: keep the dialog open, update the explanation.
      setReason(error?.reason || GEO_ERROR.UNKNOWN);
      return false;
    } finally {
      setBusy(false);
    }
  }, [applyLocation]);

  /** Manual choice from the dialog's worldwide country list. */
  const handleSelectCountry = useCallback(
    async (selection = {}) => {
      setBusy(true);
      try {
        await changeCountry(
          selection.country,
          selection.currency,
          selection.symbol,
          selection.code
        );
        setOpen(false);
        setReason(null);
      } finally {
        setBusy(false);
      }
    },
    [changeCountry]
  );

  /**
   * Dismiss. Whatever was already resolved is kept, since an IP-detected
   * currency beats forcing a default. If nothing resolved, state is already
   * the documented India / INR default.
   */
  const handleSkip = useCallback(() => {
    setOpen(false);
    setReason(null);
  }, []);

  const value = useMemo(
    () => ({ promptForLocation, isDialogOpen: open }),
    [promptForLocation, open]
  );

  return (
    <LocationPromptContext.Provider value={value}>
      {children}
      <LocationPermissionDialog
        open={open}
        reason={reason || GEO_ERROR.PERMISSION_DENIED}
        detectedCountry={country}
        fallbackCurrency={currency}
        busy={busy}
        onRetry={handleRetry}
        onSelectCountry={handleSelectCountry}
        onSkip={handleSkip}
      />
    </LocationPromptContext.Provider>
  );
};

export default LocationPromptProvider;
