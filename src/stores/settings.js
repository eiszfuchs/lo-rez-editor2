import persistentWritable from './persistent';
import { TRANSPARENT_FOLLOW } from '@/consts/settings.js';

export const filterStatuses = persistentWritable(
    [],
    'asset_list.filter_statuses'
);

export const closeOnSave = persistentWritable(false, 'settings.close_on_save');

export const transparentBackground = persistentWritable(
    TRANSPARENT_FOLLOW,
    'settings.transparent_background'
);
