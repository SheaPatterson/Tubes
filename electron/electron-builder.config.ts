/**
 * electron-builder configuration
 *
 * Builds the Electron app for:
 * - Mac: Universal binary (Apple Silicon + Intel)
 * - Windows: x64 NSIS installer
 *
 * Usage (via package.json scripts):
 *   pnpm electron:build:mac   — Build Mac DMG (universal)
 *   pnpm electron:build:win   — Build Windows NSIS installer (x64)
 */
import type { Configuration } from 'electron-builder';

const config: Configuration = {
  appId: 'com.ampsimplatform.app',
  productName: 'Amp Simulation Platform',
  copyright: 'Copyright © 2024 Amp Simulation Platform',

  directories: {
    output: 'release',
    buildResources: 'build',
  },

  files: [
    'dist-electron/**/*',
    'out/**/*',
  ],

  // Mac: Universal binary (Apple Silicon + Intel)
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['universal'],
      },
    ],
    category: 'public.app-category.music',
    icon: 'build/icon.icns',
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    artifactName: '${productName}-${version}-mac-universal.${ext}',
  },

  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' },
    ],
  },

  // Windows: x64 NSIS installer
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
    icon: 'build/icon.ico',
    artifactName: '${productName}-${version}-win-x64.${ext}',
  },

  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'build/icon.ico',
    uninstallerIcon: 'build/icon.ico',
    installerHeaderIcon: 'build/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },

  // Electron main process entry
  extraMetadata: {
    main: 'dist-electron/main.js',
  },
};

export default config;
