import { describe, it, expect } from 'vitest';
import { validateContact, validateSuggestion, validatePollOptions, hasErrors } from './validation';

describe('Validation logic', () => {
  describe('validateContact', () => {
    it('passes for valid contact inputs', () => {
      const errs = validateContact({
        name: 'Gaming Partner',
        email: 'collab@partner.gg',
        enquiry_type: 'Sponsorship',
        message: 'Hello, we would love to sponsor your upcoming BGMI livestreams!',
        consent: true,
      });
      expect(hasErrors(errs)).toBe(false);
    });

    it('requires consent confirmation', () => {
      const errs = validateContact({
        name: 'Gaming Partner',
        email: 'collab@partner.gg',
        enquiry_type: 'Sponsorship',
        message: 'Hello, we would love to sponsor your upcoming BGMI livestreams!',
        consent: false,
      });
      expect(errs.consent).toBeDefined();
    });

    it('validates email format', () => {
      const errs = validateContact({
        name: 'Gaming Partner',
        email: 'not-an-email',
        enquiry_type: 'Sponsorship',
        message: 'A sufficiently long message with more than twenty characters.',
        consent: true,
      });
      expect(errs.email).toBeDefined();
    });
  });

  describe('validateSuggestion', () => {
    it('validates minimum length and rejects link spam', () => {
      const errs = validateSuggestion({
        type: 'stream_idea',
        message: 'Check https://spam1.com and https://spam2.com and https://spam3.com',
        display_name: 'Fan',
      });
      expect(errs.message).toBeDefined();
    });

    it('accepts legitimate game challenge suggestions', () => {
      const errs = validateSuggestion({
        type: 'challenge',
        message: 'Try a solo vs squad match using only shotguns in Pochinki!',
        display_name: 'SquadLeader',
      });
      expect(hasErrors(errs)).toBe(false);
    });
  });

  describe('validatePollOptions', () => {
    it('requires at least two options', () => {
      expect(validatePollOptions(['Only One'])).toBe('Add at least two options.');
    });

    it('rejects duplicate options', () => {
      expect(validatePollOptions(['Rush', 'RUSH', 'Camp'])).toBe('Each option must be different.');
    });

    it('accepts valid distinct options', () => {
      expect(validatePollOptions(['Erangle Hot Drop', 'Sanhok Bootcamp', 'Livik Rush'])).toBeNull();
    });
  });
});
