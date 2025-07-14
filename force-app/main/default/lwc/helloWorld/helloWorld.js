import { LightningElement, api, wire } from 'lwc';
import getFieldsForObject from '@salesforce/apex/DynamicCompactLayoutController.getFieldsForObject';
import { getRecord } from 'lightning/uiRecordApi';

export default class DynamicCompactLayout extends LightningElement {
    @api recordId;
    @api objectApiName = 'Account';

    fieldList = [];
    recordData;

    @wire(getFieldsForObject, { objectApiName: '$objectApiName' })
    wiredFields({ data, error }) {
        if (data) {
            this.fieldList = data;
        } else if (error) {
            console.error('Error loading metadata fields:', error);
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$fieldList' })
    wiredRecord({ data, error }) {
        if (data) {
            this.recordData = data.fields;
        } else if (error) {
            console.error('Error loading record:', error);
        }
    }

    getFieldValue(field) {
        if (!this.recordData || !this.recordData[field]) {
            return '';
        }
        return this.recordData[field].displayValue ?? this.recordData[field].value ?? '';
    }
}
