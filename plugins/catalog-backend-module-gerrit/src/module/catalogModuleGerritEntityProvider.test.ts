/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  coreServices,
  createServiceFactory,
} from '@backstage/backend-plugin-api';
import {
  PluginTaskScheduler,
  TaskScheduleDefinition,
} from '@backstage/backend-tasks';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { Duration } from 'luxon';
import { catalogModuleGerritEntityProvider } from './catalogModuleGerritEntityProvider';
import { GerritEntityProvider } from '../providers/GerritEntityProvider';

describe('catalogModuleGerritEntityProvider', () => {
  it('should register provider at the catalog extension point', async () => {
    let addedProviders: Array<GerritEntityProvider> | undefined;
    let usedSchedule: TaskScheduleDefinition | undefined;

    const extensionPoint = {
      addEntityProvider: (providers: any) => {
        addedProviders = providers;
      },
    };
    const runner = jest.fn();
    const scheduler = {
      createScheduledTaskRunner: (schedule: TaskScheduleDefinition) => {
        usedSchedule = schedule;
        return runner;
      },
    } as unknown as PluginTaskScheduler;

    const config = {
      catalog: {
        providers: {
          gerrit: {
            test: {
              host: 'g.com',
              query: 'state=ACTIVE&prefix=training',
              branch: 'main',
              schedule: {
                frequency: 'P1M',
                timeout: 'PT3M',
              },
            },
          },
        },
      },
      integrations: {
        gerrit: [
          {
            host: 'g.com',
            baseUrl: 'https://g.com/gerrit',
            gitilesBaseUrl: 'https:/g.com/gitiles',
          },
        ],
      },
    };

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, extensionPoint]],
      features: [
        catalogModuleGerritEntityProvider(),
        mockServices.rootConfig.factory({ data: config }),
        mockServices.logger.factory(),
        createServiceFactory({
          service: coreServices.scheduler,
          deps: {},
          factory: async () => scheduler,
        }),
      ],
    });

    expect(usedSchedule?.frequency).toEqual(Duration.fromISO('P1M'));
    expect(usedSchedule?.timeout).toEqual(Duration.fromISO('PT3M'));
    expect(addedProviders?.length).toEqual(1);
    expect(addedProviders?.pop()?.getProviderName()).toEqual(
      'gerrit-provider:test',
    );
    expect(runner).not.toHaveBeenCalled();
  });
});
