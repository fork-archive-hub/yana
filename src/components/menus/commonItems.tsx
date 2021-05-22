import { MenuItemDefinition } from './types';
import { MainContentContextType } from '../mainContent/context';
import { DataItem, DataItemKind } from '../../types';
import { Alerter } from '../Alerter';
import * as React from 'react';
import { DataInterface } from '../../datasource/DataInterface';
import { InternalTag } from '../../datasource/InternalTag';
import { undup } from '../../utils';
import { IconName } from '@blueprintjs/core';
import { OverlaySearchContextValue } from '../overlaySearch/OverlaySearchProvider';
import { TelemetryService } from '../telemetry/TelemetryProvider';
import { TelemetryEvents } from '../telemetry/TelemetryEvents';
import { promptMoveItem } from '../../datasource/promptMoveItem';

export const createOpenItems = (
  mainContent: MainContentContextType,
  item: DataItem,
  icon: IconName
): Array<MenuItemDefinition | 'divider'> => [
  { text: 'Open', icon, onClick: () => mainContent.openInCurrentTab(item) },
  { text: 'Open in new Tab', icon, onClick: () => mainContent.newTab(item) },
];

export const createRenameItems = (
  item: DataItem,
  dataInterface: DataInterface,
  onStartRename?: () => void
): Array<MenuItemDefinition | 'divider'> => [
  {
    text: 'Rename',
    icon: 'edit',
    onClick:
      onStartRename ??
      (() =>
        Alerter.Instance.alert({
          content: (
            <>
              Rename item <b>{item.name}</b>:
            </>
          ),
          prompt: {
            type: 'string',
            defaultValue: item.name,
            placeholder: item.name,
            onConfirmText: name => {
              if (!!name.length) {
                dataInterface.changeItem(item.id, { name });
                TelemetryService?.trackEvent(...TelemetryEvents.Items.renameFromAlert);
              }
            },
          },
          icon: 'edit',
          cancelButtonText: 'Cancel',
          confirmButtonText: 'Rename',
        })),
  },
];

export const createNewChildsItems = (
  item: DataItem,
  dataInterface: DataInterface,
  onCreatedItem?: (item: DataItem) => void
): Array<MenuItemDefinition | 'divider'> => [
  {
    text: 'New Note Item',
    icon: 'add',
    onClick: () => {
      dataInterface
        .createDataItemUnderParent(
          {
            name: 'New Note Item',
            childIds: [],
            kind: DataItemKind.NoteItem,
            lastChange: new Date().getTime(),
            created: new Date().getTime(),
            tags: [],
            noteType: 'atlaskit-editor-note',
          } as any,
          item.id
        )
        .then(onCreatedItem);
      TelemetryService?.trackEvent(...TelemetryEvents.Items.createAtlaskitNote);
    },
  },
  {
    text: 'New...',
    icon: 'add',
    childs: [
      {
        text: 'Create new Note Item',
        icon: 'document',
        onClick: () => {
          dataInterface
            .createDataItemUnderParent(
              {
                name: 'New Note Item',
                childIds: [],
                kind: DataItemKind.NoteItem,
                lastChange: new Date().getTime(),
                created: new Date().getTime(),
                tags: [],
                noteType: 'atlaskit-editor-note',
              } as any,
              item.id
            )
            .then(onCreatedItem);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.createAtlaskitNote);
        },
      },
      {
        text: 'Create new Collection',
        icon: 'folder-open',
        onClick: () => {
          dataInterface
            .createDataItemUnderParent(
              {
                name: 'New Collection',
                childIds: [],
                kind: DataItemKind.Collection,
                lastChange: new Date().getTime(),
                created: new Date().getTime(),
                tags: [],
              } as any,
              item.id
            )
            .then(onCreatedItem);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.createCollection);
        },
      },
      { text: 'Create new Markdown Item', icon: 'document', onClick: () => {
          dataInterface.createDataItemUnderParent({
            name: 'New Markdown Item',
            childIds: [],
            kind: DataItemKind.NoteItem,
            lastChange: new Date().getTime(),
            created: new Date().getTime(),
            tags: [],
            noteType: 'markdown-editor-note'
          } as any, item.id).then(onCreatedItem);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.createAtlaskitNote);
        }},
      {
        text: 'Create new Code Snippet',
        icon: 'code',
        onClick: () => {
          dataInterface
            .createDataItemUnderParent(
              {
                name: 'New Code Item',
                childIds: [],
                kind: DataItemKind.NoteItem,
                lastChange: new Date().getTime(),
                created: new Date().getTime(),
                tags: [],
                noteType: 'monaco-editor-note',
              } as any,
              item.id
            )
            .then(onCreatedItem);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.createCodeSnippet);
        },
      },
      {
        text: 'Create new Todo List',
        icon: 'tick-circle',
        onClick: () => {
          dataInterface
            .createDataItemUnderParent(
              {
                name: 'New Todo List',
                childIds: [],
                kind: DataItemKind.NoteItem,
                lastChange: new Date().getTime(),
                created: new Date().getTime(),
                tags: [],
                noteType: 'todolist-editor-note',
              } as any,
              item.id
            )
            .then(onCreatedItem);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.createTodoList);
        },
      },
    ],
  },
];

export const createDeletionItems = (
  dataInterface: DataInterface,
  item: DataItem
): Array<MenuItemDefinition | 'divider'> =>
  item.tags.includes(InternalTag.Trash)
    ? [
        {
          text: 'Restore',
          icon: 'history',
          onClick: async () => {
            await dataInterface.changeItem(item.id, old => ({
              tags: old.tags.filter(tag => tag !== InternalTag.Trash),
            }));
            TelemetryService?.trackEvent(...TelemetryEvents.Items.restoreFromTrash);
          },
        },
        'divider',
        {
          text: 'Delete forever',
          icon: 'trash',
          intent: 'danger',
          onClick: () =>
            Alerter.Instance.alert({
              content: (
                <>
                  Are you sure you want to delete <b>{item.name}</b>?
                </>
              ),
              intent: 'danger',
              icon: 'trash',
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Delete',
              prompt: {
                type: 'boolean',
                text: 'Recursively delete all children',
                defaultValue: true,
                onConfirmBoolean: recursive => {
                  dataInterface.removeItem(item.id, recursive);
                  TelemetryService?.trackEvent(...TelemetryEvents.Items.removeFromTrash);
                },
              },
            }),
        },
      ]
    : [
        {
          text: 'Move to trash',
          icon: 'trash',
          intent: 'danger',
          onClick: async () => {
            await dataInterface.changeItem(item.id, old => ({ tags: undup([...old.tags, InternalTag.Trash]) }));
            TelemetryService?.trackEvent(...TelemetryEvents.Items.moveToTrash);
          },
        },
      ];

export const createMetaItems = (
  dataInterface: DataInterface,
  item: DataItem
): Array<MenuItemDefinition | 'divider'> => {
  const isStarred = item.tags.includes(InternalTag.Starred);

  return [
    {
      text: isStarred ? 'Remove Star' : 'Star Item',
      icon: isStarred ? 'star' : 'star-empty',
      onClick: e => {
        if (isStarred) {
          dataInterface.changeItem(item.id, i => ({ tags: i.tags.filter(tag => tag !== InternalTag.Starred) }));
          TelemetryService?.trackEvent(...TelemetryEvents.Items.unStarFromContextMenu);
        } else {
          dataInterface.changeItem(item.id, i => ({ tags: [...i.tags, InternalTag.Starred] }));
          TelemetryService?.trackEvent(...TelemetryEvents.Items.starFromContextMenu);
        }
      },
    },
  ];
};

export const createOrganizeItems = (
  dataInterface: DataInterface,
  overlaySearch: OverlaySearchContextValue,
  item: DataItem
): Array<MenuItemDefinition | 'divider'> => {
  return [
    {
      text: 'Move to...',
      icon: 'exchange',
      onClick: async () => {
        await promptMoveItem(dataInterface, overlaySearch, item);
      },
    },
    {
      text: 'Copy to...',
      icon: 'duplicate',
      onClick: async () => {
        const target = await overlaySearch.performSearch({
          selectMultiple: false,
          hiddenSearch: { kind: DataItemKind.Collection },
        });
        if (target) {
          const content = await dataInterface.getNoteItemContent(item.id);
          const { id } = await dataInterface.createDataItemUnderParent(
            {
              ...item,
              id: undefined,
              tags: item.tags.filter(t => t !== InternalTag.Draft && t !== InternalTag.Trash),
            } as any,
            target[0].id
          );
          await dataInterface.writeNoteItemContent(id, content);
          TelemetryService?.trackEvent(...TelemetryEvents.Items.copy);
        }
      },
    },
    // {
    //   text: 'Mount to folder...',
    //   icon: 'new-link',
    //   onClick: async () => {
    //     const target = await overlaySearch.performSearch({
    //       selectMultiple: false,
    //       hiddenSearch: { kind: DataItemKind.Collection }
    //     });
    //     if (target) {
    //       await dataInterface.addDataItemToParent(item.id, target[0].id);
    //     }
    //   }
    // },
    // {
    //   text: 'Dismount from folder',
    //   icon: 'small-cross',
    //   onClick: async () => {
    //     // TODO await dataInterface.removeDataItemFromParent()
    //   }
    // },
  ];
};
