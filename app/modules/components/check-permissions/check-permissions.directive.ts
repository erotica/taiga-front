import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { CheckPermissionsService} from "./check-permissions.service";
import {Store} from "@ngrx/store";
import {IState} from "../../../app.store";
import {Observable, Subscription} from "rxjs";
import * as Immutable from "immutable";

@Directive({selector: '[tgIfPerm]'})
export class IfPermDirective implements OnDestroy {
	private hasView = false;
    private project: Observable<Immutable.Map<string, any>>;
    private subscription: Subscription;
    private perm: string;

    constructor(private store: Store<IState>,
                private templateRef: TemplateRef<any>,
				private viewContainer: ViewContainerRef,
				private checkPermissions: CheckPermissionsService) {
    }

	@Input() set tgIfPerm(perm: string) {
        this.perm = perm;
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        this.subscription = this.store.select((data) => data.getIn(["projects", "current-project"])).subscribe((project) => {
            let condition = this.checkPermissions.check(this.perm);
            if (condition && !this.hasView) {
              this.viewContainer.createEmbeddedView(this.templateRef);
              this.hasView = true;
            } else if (!condition && this.hasView) {
              this.viewContainer.clear();
              this.hasView = false;
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
