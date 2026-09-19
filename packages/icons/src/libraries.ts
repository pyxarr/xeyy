import { iconLibraryIds, type IconLibraryId, type IconLibraryMetadata } from './types.ts';

export const iconLibraries: Record<IconLibraryId, IconLibraryMetadata> = {
  lucide: {
    id: 'lucide',
    displayName: 'Lucide',
    packageName: 'lucide-react',
    additionalPackageNames: [],
    importConvention: 'import { Check } from "lucide-react"',
    installSupported: true,
    migrationSourceSupported: true,
    migrationTargetSupported: true,
  },
  tabler: {
    id: 'tabler',
    displayName: 'Tabler Icons',
    packageName: '@tabler/icons-react',
    additionalPackageNames: [],
    importConvention: 'import { IconCheck } from "@tabler/icons-react"',
    installSupported: true,
    migrationSourceSupported: true,
    migrationTargetSupported: true,
  },
  hugeicons: {
    id: 'hugeicons',
    displayName: 'HugeIcons',
    packageName: '@hugeicons/react',
    // HugeIcons renders icon data supplied by a separate package.
    additionalPackageNames: ['@hugeicons/core-free-icons'],
    importConvention:
      'import { HugeiconsIcon } from "@hugeicons/react" with icon data from "@hugeicons/core-free-icons" (data-component API, not drop-in named components)',
    installSupported: true,
    migrationSourceSupported: false,
    migrationTargetSupported: false,
  },
  phosphor: {
    id: 'phosphor',
    displayName: 'Phosphor Icons',
    packageName: '@phosphor-icons/react',
    additionalPackageNames: [],
    importConvention: 'import { Check } from "@phosphor-icons/react"',
    installSupported: true,
    migrationSourceSupported: true,
    migrationTargetSupported: true,
  },
  remixicon: {
    id: 'remixicon',
    displayName: 'Remix Icon',
    packageName: '@remixicon/react',
    additionalPackageNames: [],
    importConvention: 'import { RiCheckLine } from "@remixicon/react"',
    installSupported: true,
    migrationSourceSupported: true,
    migrationTargetSupported: true,
  },
};

export function getIconLibrary(id: IconLibraryId): IconLibraryMetadata {
  return iconLibraries[id];
}

/** Every npm package name mapped back to its icon library (multi-package aware). */
const packageNameToId: Record<string, IconLibraryId> = Object.fromEntries(
  iconLibraryIds.flatMap((id) =>
    [iconLibraries[id].packageName, ...iconLibraries[id].additionalPackageNames].map(
      (packageName) => [packageName, id] as const,
    ),
  ),
);

/** Extract the root package name from a module specifier (`@scope/name/sub` -> `@scope/name`). */
function rootPackageName(packageName: string): string {
  const [first, second] = packageName.split('/');
  if (first !== undefined && first.startsWith('@') && second !== undefined) {
    return `${first}/${second}`;
  }
  return first ?? packageName;
}

/** Identify an icon library by the npm package imported in source (matches root package names only). */
export function isIconPackageName(packageName: string): IconLibraryId | undefined {
  return packageNameToId[rootPackageName(packageName)];
}
