/**
 * Tests for theme-aware style factory functions
 *
 * Each factory is called once with lightColors and once with darkColors.
 * The tests assert that:
 *   1. Backgrounds use the correct semantic token for the given theme.
 *   2. Text colours use the correct semantic token for the given theme.
 *   3. Values actually differ between themes (proving the factory is not
 *      returning hardcoded light-only values).
 *   4. Brand / action colours (buttons, primary green) remain consistent
 *      across themes.
 */

import { createAuthStyles } from '@/styles/auth.styles';
import { createSettingsStyles } from '@/styles/settings.styles';
import { createAppStyles } from '@/styles/app.styles';
import { createHomeStyles } from '@/screens/HomeScreen.styles';
import { lightColors, darkColors } from '@/hooks/useAppTheme';

// ─── createAuthStyles ─────────────────────────────────────────────────────────

describe('createAuthStyles', () => {
  const light = createAuthStyles(lightColors);
  const dark = createAuthStyles(darkColors);

  describe('backgrounds', () => {
    it('container uses screenBackgroundGreen token', () => {
      expect(light.container.backgroundColor).toBe(lightColors.screenBackgroundGreen);
      expect(dark.container.backgroundColor).toBe(darkColors.screenBackgroundGreen);
    });

    it('card uses cardBackground token', () => {
      expect(light.card.backgroundColor).toBe(lightColors.cardBackground);
      expect(dark.card.backgroundColor).toBe(darkColors.cardBackground);
    });

    it('input uses inputBackground token', () => {
      expect(light.input.backgroundColor).toBe(lightColors.inputBackground);
      expect(dark.input.backgroundColor).toBe(darkColors.inputBackground);
    });

    it('background values differ between themes', () => {
      expect(light.container.backgroundColor).not.toBe(dark.container.backgroundColor);
      expect(light.card.backgroundColor).not.toBe(dark.card.backgroundColor);
    });
  });

  describe('text colours', () => {
    it('headerText uses headerText token', () => {
      expect(light.headerText.color).toBe(lightColors.headerText);
      expect(dark.headerText.color).toBe(darkColors.headerText);
    });

    it('input text uses textPrimary token', () => {
      expect(light.input.color).toBe(lightColors.textPrimary);
      expect(dark.input.color).toBe(darkColors.textPrimary);
    });

    it('error uses error token', () => {
      expect(light.error.color).toBe(lightColors.error);
      expect(dark.error.color).toBe(darkColors.error);
    });

    it('success uses success token', () => {
      expect(light.success.color).toBe(lightColors.success);
      expect(dark.success.color).toBe(darkColors.success);
    });

    it('text colour values differ between themes', () => {
      expect(light.headerText.color).not.toBe(dark.headerText.color);
      expect(light.input.color).not.toBe(dark.input.color);
    });
  });

  describe('brand / action colours', () => {
    it('primary button colour is consistent across themes', () => {
      expect(light.button.backgroundColor).toBe('#22c55e');
      expect(dark.button.backgroundColor).toBe('#22c55e');
    });

    it('link highlight colour is consistent across themes', () => {
      expect(light.linkHighlight.color).toBe('#22c55e');
      expect(dark.linkHighlight.color).toBe('#22c55e');
    });
  });
});

// ─── createSettingsStyles ─────────────────────────────────────────────────────

describe('createSettingsStyles', () => {
  const light = createSettingsStyles(lightColors);
  const dark = createSettingsStyles(darkColors);

  describe('backgrounds', () => {
    it('container uses screenBackgroundGreen token', () => {
      expect(light.container.backgroundColor).toBe(lightColors.screenBackgroundGreen);
      expect(dark.container.backgroundColor).toBe(darkColors.screenBackgroundGreen);
    });

    it('card uses cardBackground token', () => {
      expect(light.card.backgroundColor).toBe(lightColors.cardBackground);
      expect(dark.card.backgroundColor).toBe(darkColors.cardBackground);
    });

    it('input uses inputBackground token', () => {
      expect(light.input.backgroundColor).toBe(lightColors.inputBackground);
      expect(dark.input.backgroundColor).toBe(darkColors.inputBackground);
    });

    it('background values differ between themes', () => {
      expect(light.container.backgroundColor).not.toBe(dark.container.backgroundColor);
    });
  });

  describe('text colours', () => {
    it('label uses settingsLabel token', () => {
      expect(light.label.color).toBe(lightColors.settingsLabel);
      expect(dark.label.color).toBe(darkColors.settingsLabel);
    });

    it('input text uses textPrimary token', () => {
      expect(light.input.color).toBe(lightColors.textPrimary);
      expect(dark.input.color).toBe(darkColors.textPrimary);
    });

    it('label colour differs between themes', () => {
      expect(light.label.color).not.toBe(dark.label.color);
    });
  });

  describe('sign-out button', () => {
    it('background uses signOutBackground token', () => {
      expect(light.signOutButton.backgroundColor).toBe(lightColors.signOutBackground);
      expect(dark.signOutButton.backgroundColor).toBe(darkColors.signOutBackground);
    });

    it('text uses signOutText token', () => {
      expect(light.signOutButtonText.color).toBe(lightColors.signOutText);
      expect(dark.signOutButtonText.color).toBe(darkColors.signOutText);
    });

    it('sign-out colours differ between themes', () => {
      expect(light.signOutButton.backgroundColor).not.toBe(dark.signOutButton.backgroundColor);
      expect(light.signOutButtonText.color).not.toBe(dark.signOutButtonText.color);
    });
  });

  describe('brand / action colours', () => {
    it('primary button colour is consistent across themes', () => {
      expect(light.button.backgroundColor).toBe('#22c55e');
      expect(dark.button.backgroundColor).toBe('#22c55e');
    });
  });
});

// ─── createAppStyles ──────────────────────────────────────────────────────────

describe('createAppStyles', () => {
  const light = createAppStyles(lightColors);
  const dark = createAppStyles(darkColors);

  it('container uses screenBackgroundGreen token', () => {
    expect(light.container.backgroundColor).toBe(lightColors.screenBackgroundGreen);
    expect(dark.container.backgroundColor).toBe(darkColors.screenBackgroundGreen);
    expect(light.container.backgroundColor).not.toBe(dark.container.backgroundColor);
  });

  it('card uses cardBackground token', () => {
    expect(light.card.backgroundColor).toBe(lightColors.cardBackground);
    expect(dark.card.backgroundColor).toBe(darkColors.cardBackground);
    expect(light.card.backgroundColor).not.toBe(dark.card.backgroundColor);
  });

  it('weatherText uses forecastTemp token', () => {
    expect(light.weatherText.color).toBe(lightColors.forecastTemp);
    expect(dark.weatherText.color).toBe(darkColors.forecastTemp);
    expect(light.weatherText.color).not.toBe(dark.weatherText.color);
  });

  it('reminderItem uses reminderBackground token', () => {
    expect(light.reminderItem.backgroundColor).toBe(lightColors.reminderBackground);
    expect(dark.reminderItem.backgroundColor).toBe(darkColors.reminderBackground);
    expect(light.reminderItem.backgroundColor).not.toBe(dark.reminderItem.backgroundColor);
  });

  it('reminderTitle uses reminderTitle token', () => {
    expect(light.reminderTitle.color).toBe(lightColors.reminderTitle);
    expect(dark.reminderTitle.color).toBe(darkColors.reminderTitle);
    expect(light.reminderTitle.color).not.toBe(dark.reminderTitle.color);
  });

  it('errorText uses error token', () => {
    expect(light.errorText.color).toBe(lightColors.error);
    expect(dark.errorText.color).toBe(darkColors.error);
    expect(light.errorText.color).not.toBe(dark.errorText.color);
  });
});

// ─── createHomeStyles ─────────────────────────────────────────────────────────

describe('createHomeStyles', () => {
  const light = createHomeStyles(lightColors);
  const dark = createHomeStyles(darkColors);

  it('container uses screenBackgroundGreen token', () => {
    expect(light.container.backgroundColor).toBe(lightColors.screenBackgroundGreen);
    expect(dark.container.backgroundColor).toBe(darkColors.screenBackgroundGreen);
    expect(light.container.backgroundColor).not.toBe(dark.container.backgroundColor);
  });

  it('card uses cardBackground token', () => {
    expect(light.card.backgroundColor).toBe(lightColors.cardBackground);
    expect(dark.card.backgroundColor).toBe(darkColors.cardBackground);
    expect(light.card.backgroundColor).not.toBe(dark.card.backgroundColor);
  });

  it('sectionTitle uses textPrimary token', () => {
    expect(light.sectionTitle.color).toBe(lightColors.textPrimary);
    expect(dark.sectionTitle.color).toBe(darkColors.textPrimary);
    expect(light.sectionTitle.color).not.toBe(dark.sectionTitle.color);
  });

  it('reminderItem uses reminderBackground token', () => {
    expect(light.reminderItem.backgroundColor).toBe(lightColors.reminderBackground);
    expect(dark.reminderItem.backgroundColor).toBe(darkColors.reminderBackground);
    expect(light.reminderItem.backgroundColor).not.toBe(dark.reminderItem.backgroundColor);
  });

  it('reminderTitle uses reminderTitle token', () => {
    expect(light.reminderTitle.color).toBe(lightColors.reminderTitle);
    expect(dark.reminderTitle.color).toBe(darkColors.reminderTitle);
    expect(light.reminderTitle.color).not.toBe(dark.reminderTitle.color);
  });
});
