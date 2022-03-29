/**
 * SuiteCRM is a customer relationship management program developed by SalesAgility Ltd.
 * Copyright (C) 2021 SalesAgility Ltd.
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License version 3 as published by the
 * Free Software Foundation with the addition of the following permission added
 * to Section 15 as permitted in Section 7(a): FOR ANY PART OF THE COVERED WORK
 * IN WHICH THE COPYRIGHT IS OWNED BY SALESAGILITY, SALESAGILITY DISCLAIMS THE
 * WARRANTY OF NON INFRINGEMENT OF THIRD PARTY RIGHTS.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * In accordance with Section 7(b) of the GNU Affero General Public License
 * version 3, these Appropriate Legal Notices must retain the display of the
 * "Supercharged by SuiteCRM" logo. If the display of the logos is not reasonably
 * feasible for technical reasons, the Appropriate Legal Notices must display
 * the words "Supercharged by SuiteCRM".
 */

import {Injectable} from '@angular/core';
import {Action, ActionContext, ViewMode} from 'common';
import {combineLatest, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {AsyncActionService} from '../../../services/process/processes/async-action/async-action';
import {LanguageStore} from '../../../store/language/language.store';
import {MessageService} from '../../../services/message/message.service';
import {Process} from '../../../services/process/process.service';
import {ConfirmationModalService} from '../../../services/modals/confirmation-modal.service';
import {BaseRecordActionsAdapter} from '../../../services/actions/base-record-action.adapter';
import {RecordPanelActionData} from '../../../containers/record-panel/components/record-panel/record-panel.model';
import {RecordPanelStore} from '../../../containers/record-panel/store/record-panel/record-panel.store';
import {RecordPanelActionManager} from '../actions/record-panel/record-panel-action-manager.service';
import {ListViewStore} from '../store/list-view/list-view.store';
import {ListViewRecordPanelActionData} from '../actions/record-panel/record-panel.action';
import {SelectModalService} from '../../../services/modals/select-modal.service';

@Injectable()
export class ListViewRecordPanelActionsAdapter extends BaseRecordActionsAdapter<RecordPanelActionData> {

    constructor(
        protected store: RecordPanelStore,
        protected listStore: ListViewStore,
        protected language: LanguageStore,
        protected actionManager: RecordPanelActionManager,
        protected asyncActionService: AsyncActionService,
        protected message: MessageService,
        protected confirmation: ConfirmationModalService,
        protected selectModalService: SelectModalService
    ) {
        super(
            actionManager,
            asyncActionService,
            message,
            confirmation,
            language,
            selectModalService
        )
    }

    getActions(context?: ActionContext): Observable<Action[]> {
        return combineLatest(
            [
                this.store.meta$,
                this.store.mode$,
                this.store.stagingRecord$,
                this.language.vm$,
            ]
        ).pipe(
            map((
                [
                    meta,
                    mode
                ]
            ) => {
                if (!mode || !meta) {
                    return [];
                }

                return this.parseModeActions(meta.actions, mode);
            })
        );
    }

    protected buildActionData(action: Action, context?: ActionContext): RecordPanelActionData {
        return {
            store: this.store,
            listStore: this.listStore,
            action
        } as ListViewRecordPanelActionData;
    }

    protected getMode(): ViewMode {
        return this.store.getMode();
    }

    protected getModuleName(context?: ActionContext): string {
        return this.store.getModuleName();
    }

    protected reload(action: Action, process: Process, context?: ActionContext): void {
        this.listStore.load(false).pipe(take(1)).subscribe();
    }
}
