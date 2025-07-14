import { LightningElement, api, wire, track } from 'lwc';
import getFields from '@salesforce/apex/DynamicCompactLayoutController.getFields';

export default class dynamicCompactLayout extends LightningElement {
    @api recordId;
    @track fields = [];

    connectedCallback() {
        getFields('Account')
            .then(result => {
                this.fields = result;
            })
            .catch(error => {
                console.error('Error fetching field list:', error);
            });
    }
}
