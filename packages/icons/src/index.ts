export {
  iconLibraryIds,
  type IconLibraryId,
  type IconLibraryMetadata,
} from './types.ts';

export {
  iconLibraries,
  getIconLibrary,
  isIconPackageName,
} from './libraries.ts';

export {
  canonicalToTargetName,
  targetToCanonicalName,
  mapIconName,
} from './mappings.ts';

export { tablerIconNames } from './mappings/tabler.ts';
export { phosphorIconNames } from './mappings/phosphor.ts';
export { remixIconNames } from './mappings/remixicon.ts';
