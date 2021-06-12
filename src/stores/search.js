import { writable } from 'svelte/store';

import WarningAltFilled16 from 'carbon-icons-svelte/lib/WarningAltFilled16';
import ArrowDown16 from 'carbon-icons-svelte/lib/ArrowDown16';
import ArrowUp16 from 'carbon-icons-svelte/lib/ArrowUp16';
import IncompleteWarning16 from 'carbon-icons-svelte/lib/IncompleteWarning16';

export const filterWarnings = writable([
    {
        label: 'Undefined',
        id: 'version',
        iconComponent: WarningAltFilled16,
        showEntries: true,
    },
    {
        label: 'Outdated',
        id: 'outdated',
        iconComponent: ArrowDown16,
        showEntries: true,
    },
    {
        label: 'Future',
        id: 'fromFuture',
        iconComponent: ArrowUp16,
        showEntries: true,
    },
    {
        label: 'Draft',
        id: 'draft',
        iconComponent: IncompleteWarning16,
        showEntries: true,
    },
]);
