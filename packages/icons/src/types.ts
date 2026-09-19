export const iconLibraryIds = ['lucide', 'tabler', 'hugeicons', 'phosphor', 'remixicon'] as const;

export type IconLibraryId = (typeof iconLibraryIds)[number];

export interface IconLibraryMetadata {
  readonly id: IconLibraryId;
  readonly displayName: string;
  /** npm package providing the icon components consumed in source. */
  readonly packageName: string;
  /** Additional npm packages required alongside `packageName` (multi-package libraries). */
  readonly additionalPackageNames: readonly string[];
  /** Human-readable import convention, e.g. `import { Check } from "lucide-react"`. */
  readonly importConvention: string;
  /** Whether `xeyy add` can install/declare this package as a dependency. */
  readonly installSupported: boolean;
  /** Whether verified migration mappings exist away from this library. */
  readonly migrationSourceSupported: boolean;
  /** Whether verified migration mappings exist into this library. */
  readonly migrationTargetSupported: boolean;
}
