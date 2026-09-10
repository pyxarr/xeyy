export type {
  AccessibilityMetadata,
  LicenseMetadata,
  RegistryFile,
  RegistryFileType,
  RegistryItem,
  RegistryItemType,
  RegistryRoot,
  StyleXMetadata,
  ThemeMetadata,
  TokenMetadata,
} from './schemas.ts';

export {
  accessibilityMetadataSchema,
  licenseMetadataSchema,
  registryFileSchema,
  registryFileTypeSchema,
  registryItemSchema,
  registryItemTypeSchema,
  registryRootSchema,
  stylexMetadataSchema,
  themeMetadataSchema,
  tokenMetadataSchema,
} from './schemas.ts';

export type {
  RegistryItemValidationResult,
  RegistryValidationIssue,
  RegistryValidationResult,
} from './validate.ts';

export {
  isSafeRegistryPath,
  loadRegistryItemFromRoot,
  validateRegistryItem,
  validateRegistryRoot,
} from './validate.ts';