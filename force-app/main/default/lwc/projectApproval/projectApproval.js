import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import APPROVED_FIELD from '@salesforce/schema/Account.Approved__c';
import ID_FIELD from '@salesforce/schema/Account.Id';

const FIELDS = [APPROVED_FIELD];

export default class ProjectApproval extends LightningElement {
    @api recordId;
    isApproved = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            this.isApproved = data.fields.Approved__c.value;
        } else if (error) {
            console.error('Error fetching Approved__c:', error);
        }
    }

    handleApprove() {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[APPROVED_FIELD.fieldApiName] = true;

        updateRecord({ fields })
            .then(() => {
                this.isApproved = true;
                window.alert('Account approved');
                window.location.reload();

            })
            .catch(error => {
                console.error('Error approving record:', error);
            });
    }
}
