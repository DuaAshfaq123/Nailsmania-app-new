import {debugLog} from '../../utils/debugLog';
import {productionLog} from '../../utils/productionLog';

/**
 * The three once-per-app-session ad opportunities.
 *
 * FIRST_FULL_VIEW and HOME_DESIGN_FULL_VIEW are tracked separately on purpose: the first
 * Full View of a session can be reached from Saved or the category gallery, in which case
 * the Home -> design flow has not happened yet and still deserves its own ad later. When
 * they DO coincide — the common case, Home -> design being the first Full View — both are
 * consumed by the single ad that shows, so they can never fire back to back.
 */
export const SESSION_AD_TRIGGERS = {
  FIRST_FULL_VIEW: 'first_full_view',
  FIRST_SAVED_VISIT: 'first_saved_visit',
  HOME_DESIGN_FULL_VIEW: 'home_design_full_view',
};

/**
 * Tracks which per-session ad opportunities have already been spent.
 *
 * Deliberately in-memory only. "One time per session" is defined as one time per app
 * process: a full close and relaunch creates a fresh module instance with an empty set, so
 * every trigger becomes eligible again with no persistence, no clock arithmetic and no
 * migration surface. Writing these counters to EncryptedStorage would also make them
 * survive a crash, which is the opposite of the requirement.
 *
 * Nothing here touches React state — a plain Set in module scope is immune to re-renders,
 * remounts and navigation focus events, which is exactly what makes duplicate ads
 * impossible at this layer.
 */
class SessionAdGate {
  constructor() {
    this.consumed = new Set();
  }

  /** Called once per app session, from App.js when the splash finishes. */
  reset() {
    this.consumed.clear();
    debugLog('SessionAdGate', 'Session ad triggers reset');
    productionLog('SessionAdGate', 'Session ad triggers reset');
  }

  isPending(trigger) {
    return !this.consumed.has(trigger);
  }

  /**
   * Filters a candidate list down to the triggers that have not been spent yet.
   * Returns a new array; callers pass the result straight to showSessionAd().
   */
  getPending(triggers) {
    return triggers.filter(trigger => this.isPending(trigger));
  }

  /**
   * Marks a batch as spent. Called ONLY after an ad has actually rendered — a blocked or
   * failed attempt must leave the triggers pending so they retry at the next natural
   * opportunity instead of being silently lost.
   */
  consume(triggers) {
    triggers.forEach(trigger => this.consumed.add(trigger));
    debugLog('SessionAdGate', 'Session ad triggers consumed', {triggers});
    productionLog('SessionAdGate', 'Session ad triggers consumed', {
      triggers,
      totalConsumed: this.consumed.size,
    });
  }

  getDiagnostics() {
    return {
      consumed: Array.from(this.consumed),
      pending: Object.values(SESSION_AD_TRIGGERS).filter(trigger =>
        this.isPending(trigger),
      ),
    };
  }
}

export default new SessionAdGate();
