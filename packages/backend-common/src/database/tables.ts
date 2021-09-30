/*
 * Copyright 2021 The Backstage Authors
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

export type DbMutexesRow = {
  id: string;
  current_lock_ticket?: string;
  current_lock_acquired_at?: Date;
  current_lock_expires_at?: Date;
};

export type DbTasksRow = {
  id: string;
  settings_json: string;
  next_run_start_at?: Date;
  current_run_ticket?: string;
  current_run_started_at?: Date;
  current_run_expires_at?: Date;
};
